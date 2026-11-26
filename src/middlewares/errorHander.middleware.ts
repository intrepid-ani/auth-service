/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { logger } from "../config/logger/logger.config";
import { randomUUID } from "crypto";

export function errorHandler(
    err: HttpError | Error,
    req: Request,
    res: Response,
    _: NextFunction
) {
    const errorId = randomUUID();
    const statusCode: number =
        "statusCode" in err && typeof err.statusCode === "number" ?
            err.statusCode
        : "status" in err && typeof err.status === "number" ? err.status
        : 500;

    const isServerCrisis: boolean = statusCode >= 500;

    // 1. Log EVERYTHING internally with the errorId
    logger.error(
        `[${req.method}] ${req.path} - Status: ${String(statusCode)} | Message: ${err.message}`,
        {
            id: errorId,
            error: err.stack,
            path: req.path,
            method: req.method,
        }
    );

    // 2. Format what to expose to the client
    const clientError = {
        ref: isServerCrisis ? errorId : undefined,
        type: err.name || "SERVER_ERROR",
        msg:
            isServerCrisis ?
                "Internal server error. Please try again later."
            :   err.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        path: (err as any).path,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        location: (err as any).location,
        ...(process.env.NODE_ENV === "development" && isServerCrisis ?
            { stack: err.stack }
        :   {}),
    };

    return res.status(statusCode).json({
        errors: [clientError],
    });
}
