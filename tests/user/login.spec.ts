/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
    beforeAll,
    describe,
    expect,
    test,
    beforeEach,
    afterAll,
} from "@jest/globals";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/db";
import { truncateAllEntities } from "../utiles";
import request from "supertest";
import { app } from "../../src/app";
import { ValidationErrorItem } from "../types";
import { JwtPayload, verify } from "jsonwebtoken";
import { RefreshToken } from "../../src/entities/RefreshToken";

const loginRoute = "/auth/api/v0/login";

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

// async function regsiterUser() {
//     return { ...user, password: userData.password };
// }

describe("POST/ /auth/api/v0/login", () => {
    describe("Success testcases", () => {
        test("status code 200 & application/json", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };
            await request(app).post("/auth/api/v0/register").send(userData);

            const response = await request(app).post(loginRoute).send(userData);
            expect(response.status).toBe(200);
            expect(
                (response.headers as Record<string, string>)["content-type"]
            ).toContain("json");
            expect(typeof response.body.message).toBe("string");
            expect(response.body.message).toBe("Successfully logged in");
        });

        test("set access token", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };
            await request(app).post("/auth/api/v0/register").send(userData);
            const response = await request(app)
                .post(loginRoute)
                .send({ email: userData.email, password: userData.password });

            const setCookies: Record<string, unknown> = response.headers[
                "set-cookie"
            ] as unknown as Record<string, unknown>;
            expect(setCookies).toBeDefined();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const cookie: Record<string, unknown> =
                Array.isArray(setCookies) ? setCookies[0] : setCookies;
            expect(cookie).toContain("accessToken=");
            expect(cookie).toContain("HttpOnly");
            expect(cookie).toContain("SameSite=Strict");

            expect(response.status).toBe(200);
        });

        test("set refresh token", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };
            await request(app).post("/auth/api/v0/register").send(userData);

            const response = await request(app).post(loginRoute).send({
                email: userData.email,
                password: userData.password,
            });

            const setCookies = response.headers["set-cookie"];
            expect(setCookies).toBeDefined();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const cookie: Record<string, unknown> =
                Array.isArray(setCookies) ? setCookies[1] : setCookies;
            expect(cookie).toContain("refreshToken=");
            expect(cookie).toContain("HttpOnly");
            expect(cookie).toContain("SameSite=Strict");
        });

        test("persist refresh token", async () => {
            const userData = {
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: "test_password",
            };
            await request(app).post("/auth/api/v0/register").send(userData);

            const response = await request(app).post(loginRoute).send({
                email: userData.email,
                password: userData.password,
            });

            const setCookies = response.headers["set-cookie"];
            expect(setCookies).toBeDefined();

            const refreshToken = setCookies[1].split(";")[0].substring(13);

            const decodedToken: JwtPayload = verify(
                refreshToken,
                "HELLOAUTHTEST"
            ) as Record<string, string>;

            const tokenRepository = AppDataSource.getRepository(RefreshToken);
            const dbToken = await tokenRepository.findOne({
                where: { id: decodedToken.tokenId as number },
                relations: { user: true },
            });

            expect(dbToken).not.toBeNull();
            expect(dbToken?.userId).toBe(dbToken?.user.id);
            expect(dbToken?.user.email).toBe(userData.email);
        });
    });

    describe("Validation testcases", () => {
        describe("Email validation", () => {
            test("Incomplete email", async () => {
                const userData = {
                    password: "test_password",
                };
                const response = await request(app)
                    .post(loginRoute)
                    .send(userData);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors: ValidationErrorItem[] }).errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: "email",
                            msg: "Email is required",
                        }),
                    ])
                );
            });

            test("Incorrect email", async () => {
                const userData = {
                    email: "Incorrect_email",
                    password: "test_password",
                };
                const response = await request(app)
                    .post(loginRoute)
                    .send(userData);

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
            test("Incomplete Password", async () => {
                const userData = {
                    email: "test@email.com",
                };
                const response = await request(app)
                    .post(loginRoute)
                    .send(userData);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors: ValidationErrorItem[] }).errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: "password",
                            msg: "Password is required",
                        }),
                    ])
                );
            });

            test("Incorrect length password", async () => {
                const userData = {
                    email: "Incorrect_email",
                    password: "test",
                };
                const response = await request(app)
                    .post(loginRoute)
                    .send(userData);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors: ValidationErrorItem[] }).errors
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: "password",
                            msg: "Incorrect email or password",
                        }),
                    ])
                );
            });
        });

        describe("Empty request body validation", () => {
            test("status 400 and returns validation errors for all fields when body is empty", async () => {
                const response = await request(app).post(loginRoute).send({});

                expect(response.status).toBe(400);
                const errors = (
                    response.body as { errors: ValidationErrorItem[] }
                ).errors;
                expect(errors.length).toBe(4);

                const paths = errors.map(err => err.path);
                expect(paths).toContain("email");
                expect(paths).toContain("password");
            });
        });
    });
});
