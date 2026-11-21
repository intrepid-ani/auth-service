import "reflect-metadata";
import express from "express";
import type { Response, Request, NextFunction } from "express";
import { HttpError } from "http-errors";

export const app = express();

app.all(["/", "/health"], (_, res: Response) => {
    res.status(200).json({
        statusCode: "SERVER_IS_HEALTHY",
        message: "Server is running...",
    });
});

// Global Error handling file
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log(err, req, res);
    res.send(err.message);
});
