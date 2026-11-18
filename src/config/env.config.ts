import { configDotenv } from "dotenv";
import { join } from "path";

const NODE_ENV = String(process.env.NODE_ENV);
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (NODE_ENV == undefined) {
    // eslint-disable-next-line no-console
    console.log(
        `Node Env not found, ${NODE_ENV as string}, \n"Exit the program"`
    );
    process.exit(1);
}

const path = join(process.cwd(), `/.env.${NODE_ENV}`);

configDotenv({ path });

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
