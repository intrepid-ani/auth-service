import "reflect-metadata";
import express from "express";
import type { Response, Request, NextFunction } from "express";
import { HttpError } from "http-errors";
import { authRoutes } from "./routes/auth.route";

export const app = express();

app.use(express.json());

app.all(["/", "/health"], (_, res: Response) => {
    res.status(200).json({
        statusCode: "SERVER_IS_HEALTHY",
        message: "Server is running...",
    });
});

app.use("/auth/api/v0/", authRoutes);

// Global Error handling file
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line no-console
    // console.log(err, req, res);
    res.status(err.status).json({ message: err.message, err: err.expose });
});
