import { configDotenv } from "dotenv";

configDotenv();

function confirmENV(name: string) {
    const envVarible = process.env[name];

    if (!envVarible) {
        throw new Error(
            `Configuration Failed: Can't find env variable ${name}`
        );
    }

    return envVarible;
}

export const env = Object.freeze({
    PORT: confirmENV("PORT"),
});
