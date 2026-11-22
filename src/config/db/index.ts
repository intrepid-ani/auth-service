import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../entities/User";
import { env } from "../env.config";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: env.NODE_ENV === "test" || env.NODE_ENV === "local",
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
