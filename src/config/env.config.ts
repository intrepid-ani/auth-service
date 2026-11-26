import { configDotenv } from "dotenv";
import { join } from "path";
import { logger } from "./logger/logger.config";

const NODE_ENV = String(process.env.NODE_ENV);
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (NODE_ENV == undefined) {
    logger.error("Configuration Failed: Can't find NODE_ENV", NODE_ENV);
    process.exit(1);
}

const path = join(process.cwd(), `/.env.${NODE_ENV}`);

configDotenv({ path });

function confirmENV(name: string) {
    const envVarible = process.env[name];

    if (!envVarible) {
        logger.error(
            `Configuration Failed: Can't find env variable ${name}`,
            envVarible
        );
        process.exit(1);
    }

    return envVarible;
}

export const env = Object.freeze({
    PORT: confirmENV("PORT"),
    NODE_ENV,
    DOMAIN: confirmENV("DOMAIN_NAME"),

    // database
    DB_HOST: confirmENV("DB_HOST"),
    DB_USERNAME: confirmENV("DB_USERNAME"),
    DB_PASSWORD: confirmENV("DB_PASSWORD"),
    DB_NAME: confirmENV("DB_NAME"),
    DB_PORT: confirmENV("DB_PORT"),

    // security
    JWT_SECRET: confirmENV("JWT_SECRET"),
});
