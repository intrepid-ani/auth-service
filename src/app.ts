import "reflect-metadata";
import express from "express";
import type { Response } from "express";
import { authRoutes } from "./routes/auth.route";
import { errorHandler } from "./middlewares/errorHander.middleware";

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
app.use(errorHandler);
