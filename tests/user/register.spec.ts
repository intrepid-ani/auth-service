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

// constants
const bcryptRegex = /^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/;

let connection: DataSource;
beforeAll(async () => {
    connection = await AppDataSource.initialize();
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
    });
});
