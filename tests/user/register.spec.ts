import {
    beforeAll,
    describe,
    expect,
    test,
    beforeEach,
    afterAll,
} from "@jest/globals";
import request from "supertest";
import { app } from "../../src/app";
import { AppDataSource } from "../../src/config/db";
import { DataSource } from "typeorm";
import { truncateAllEntities } from "../utiles";
import { User } from "../../src/entities/User";
import { userRoles } from "../../src/constants";
import { RefreshToken } from "../../src/entities/RefreshToken";
import { JwtPayload, verify } from "jsonwebtoken";
import { ValidationErrorItem } from "../types";

// constants
const bcryptRegex = /^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/;

let connection: DataSource;
beforeAll(async () => {
    connection = await AppDataSource.initialize();
    await connection.synchronize();
    await truncateAllEntities(connection);
});

beforeEach(async () => {
    await truncateAllEntities(connection);
});

afterAll(async () => {
    await connection.destroy();
});

describe("POST/ /auth/api/v0/register", () => {
    describe("Success testcases", () => {
        test("status code 200 & application/json", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };

            const response = await request(app)
                .post("/auth/api/v0/register")
                .send(userData);

            expect(response.status).toBe(201);
            expect(
                (response.headers as Record<string, string>)["content-type"]
            ).toContain("json");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(typeof response.body.message).toBe("string");
        });

        test("persist user in database", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };

            await request(app).post("/auth/api/v0/register").send(userData);

            const UserRepository = connection.getRepository(User);
            const dbData = await UserRepository.find();

            expect(dbData.length).toBe(1);
        });

        test("return user details", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { body }: { body: Record<string, unknown> } = await request(
                app
            )
                .post("/auth/api/v0/register")
                .send(userData);

            expect((body.user as Record<string, string>).firstname).toBe(
                userData.firstname
            );
            expect((body.user as Record<string, string>).lastname).toBe(
                userData.lastname
            );
            expect((body.user as Record<string, string>).email).toBe(
                userData.email
            );
        });

        test("store hashed password", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };

            await request(app).post("/auth/api/v0/register").send(userData);

            const UserRepository = connection.getRepository(User);
            const dbData = await UserRepository.find();

            expect(dbData[0].password).not.toBe(userData.password);
            expect(dbData[0].password).toMatch(bcryptRegex);
        });

        test("assign role while regiter", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };

            await request(app).post("/auth/api/v0/register").send(userData);

            const UserRepository = connection.getRepository(User);
            const dbData = await UserRepository.find();

            expect(dbData[0].role).toBe(userRoles.CUSTOMER);
        });

        describe("Access and Refresh token", () => {
            test("Return and set access token", async () => {
                const userData = {
                    firstname: "test_firstname",
                    lastname: "test_lastname",
                    email: "test@email.com",
                    password: "test_password",
                };

                const response = await request(app)
                    .post("/auth/api/v0/register")
                    .send(userData);

                const accessToken = (
                    response.body as {
                        tokens: { accessToken: string };
                    }
                ).tokens.accessToken;

                expect(typeof accessToken).toBe("string");
                expect(accessToken.length).toBeGreaterThan(0);

                const setCookieHeader = response.headers["set-cookie"];
                expect(setCookieHeader).toBeDefined();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const cookie: Record<string, unknown> =
                    Array.isArray(setCookieHeader) ?
                        setCookieHeader[0]
                    :   setCookieHeader;
                expect(cookie).toContain("accessToken=");
                expect(cookie).toContain("HttpOnly");
                expect(cookie).toContain("SameSite=Strict");
            });

            test("Return and set Refresh token", async () => {
                const userData = {
                    firstname: "test_firstname",
                    lastname: "test_lastname",
                    email: "test@email.com",
                    password: "test_password",
                };

                const response = await request(app)
                    .post("/auth/api/v0/register")
                    .send(userData);

                const setCookies = response.headers["set-cookie"];
                expect(setCookies).toBeDefined();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const cookie: Record<string, unknown> =
                    Array.isArray(setCookies) ? setCookies[1] : setCookies;

                expect(cookie).toContain("refreshToken=");
                expect(cookie).toContain("HttpOnly");
                expect(cookie).toContain("SameSite=Strict");
            });

            test("persists refresh token", async () => {
                const userData = {
                    firstname: "test_firstname",
                    lastname: "test_lastname",
                    email: "test@email.com",
                    password: "test_password",
                };

                const apiResponse = await request(app)
                    .post("/auth/api/v0/register")
                    .send(userData);

                // validate the headers value
                expect(apiResponse.headers["set-cookie"]).toBeDefined();

                // validate database
                const tokenRepository = connection.getRepository(RefreshToken);
                const tokenFromDB = await tokenRepository.find();

                expect(tokenFromDB).toHaveLength(1);

                // validate actuall tokens
                const setCookies = apiResponse.headers["set-cookie"];
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const tokens =
                    Array.isArray(setCookies) ? setCookies[1] : setCookies;
                const refreshToken: string = (tokens as string)
                    .split(";")[0]
                    .substring(13);

                const payload: JwtPayload = verify(
                    refreshToken,
                    "HELLOAUTHTEST"
                ) as JwtPayload;

                expect(payload.tokenId).toBe(tokenFromDB[0].id);
            });
        });
    });
});

describe("Error related testcases", () => {
    test("status 422 & return error", async () => {
        const userData = {
            firstname: "test_firstname",
            lastname: "test_lastname",
            email: "test@email.com",
            password: "test_password",
        };

        await request(app).post("/auth/api/v0/register").send(userData);
        const response = await request(app)
            .post("/auth/api/v0/register")
            .send(userData);

        expect(response.status).toBe(422);
        expect(
            (response.body as { errors: unknown[] }).errors.length
        ).toBeGreaterThan(0);
        expect(
            (response.body as { errors: unknown[] }).errors[0]
        ).toMatchObject({
            type: "DUPLICATE_EMAIL",
            msg: "Email is already in use",
            path: "email",
            location: "body",
        });
    });

    test("Email is required: status 400", async () => {
        const userData = {
            firstname: "test_firstname",
            lastname: "test_lastname",
            password: "test_password",
        };

        const response = await request(app)
            .post("/auth/api/v0/register")
            .send(userData);

        expect(response.status).toBe(400);
        expect(
            (response.body as { errors: ValidationErrorItem[] }).errors
        ).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: "email",
                    msg: "Email must be a string",
                }),
            ])
        );
    });
});

describe("Validation testcases", () => {
    const validUserData = {
        firstname: "test_firstname",
        lastname: "test_lastname",
        email: "test@email.com",
        password: "test_password",
    };

    describe("Firstname validation", () => {
        test("status 400 when firstname is missing", async () => {
            const payload: Record<string, unknown> = { ...validUserData };
            delete payload.firstname;

            const response = await request(app)
                .post("/auth/api/v0/register")
                .send(payload);

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "firstname",
                        msg: "First name must be a string",
                    }),
                ])
            );
        });

        test("status 400 when firstname is less than 3 characters", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, firstname: "ab" });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "firstname",
                        msg: "First name must be between 3 and 24 characters",
                    }),
                ])
            );
        });

        test("status 400 when firstname is greater than 24 characters", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, firstname: "a".repeat(25) });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "firstname",
                        msg: "First name must be between 3 and 24 characters",
                    }),
                ])
            );
        });

        test("status 400 when firstname is not a string", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, firstname: 12345 });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "firstname",
                        msg: "First name must be a string",
                    }),
                ])
            );
        });
    });

    describe("Lastname validation", () => {
        test("status 400 when lastname is missing", async () => {
            const payload: Record<string, unknown> = { ...validUserData };
            delete payload.lastname;

            const response = await request(app)
                .post("/auth/api/v0/register")
                .send(payload);

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "lastname",
                        msg: "Last name must be a string",
                    }),
                ])
            );
        });

        test("status 400 when lastname is less than 3 characters", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, lastname: "ab" });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "lastname",
                        msg: "Last name must be between 3 and 24 characters",
                    }),
                ])
            );
        });

        test("status 400 when lastname is greater than 24 characters", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, lastname: "a".repeat(25) });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "lastname",
                        msg: "Last name must be between 3 and 24 characters",
                    }),
                ])
            );
        });

        test("status 400 when lastname is not a string", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, lastname: 12345 });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "lastname",
                        msg: "Last name must be a string",
                    }),
                ])
            );
        });
    });

    describe("Email validation", () => {
        test("status 400 when email is missing", async () => {
            const payload: Record<string, unknown> = { ...validUserData };
            delete payload.email;

            const response = await request(app)
                .post("/auth/api/v0/register")
                .send(payload);

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "email",
                        msg: "Email must be a string",
                    }),
                ])
            );
        });

        test("status 400 when email is invalid format", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, email: "invalid-email-format" });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "email",
                        msg: "Email must be a valid email address",
                    }),
                ])
            );
        });
    });

    describe("Password validation", () => {
        test("status 400 when password is missing", async () => {
            const payload: Record<string, unknown> = { ...validUserData };
            delete payload.password;

            const response = await request(app)
                .post("/auth/api/v0/register")
                .send(payload);

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "password",
                        msg: "Password must be a string",
                    }),
                ])
            );
        });

        test("status 400 when password is less than 8 characters", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({ ...validUserData, password: "1234567" });

            expect(response.status).toBe(400);
            expect(
                (response.body as { errors: ValidationErrorItem[] }).errors
            ).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: "password",
                        msg: "Password must be at least 8 characters long",
                    }),
                ])
            );
        });
    });

    describe("Empty request body validation", () => {
        test("status 400 and returns validation errors for all fields when body is empty", async () => {
            const response = await request(app)
                .post("/auth/api/v0/register")
                .send({});

            expect(response.status).toBe(400);
            const errors = (response.body as { errors: ValidationErrorItem[] })
                .errors;
            expect(errors.length).toBe(4);

            const paths = errors.map(err => err.path);
            expect(paths).toContain("firstname");
            expect(paths).toContain("lastname");
            expect(paths).toContain("email");
            expect(paths).toContain("password");
        });
    });
});
