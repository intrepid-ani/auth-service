import { createLogger, format, transports } from "winston";

export const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "HH:mm:ss DD-MM-YYYY" }),
        format.json()
    ),
    transports: [
        new transports.File({
            level: "error",
            filename: "./logger-output/error-logs.txt",
        }),
        new transports.File({
            level: "info",
            filename: "./logger-output/info-logs.txt",
        }),
        new transports.Console({
            level: "silly",
            format: format.combine(
                format.colorize({ all: true }),
                format.printf(({ timestamp, level, message }) => {
                    return `${timestamp as string} [${level}]: ${message as string}`;
                })
            ),
        }),
    ],
});
