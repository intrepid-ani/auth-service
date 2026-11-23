/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { RequestUserData } from "../types";
import createHttpError from "http-errors";

export class AuthControllers {
    constructor(private userService: UserService) {}

    async register(req: RequestUserData, res: Response, next: NextFunction) {
        try {
            const { email, firstname, lastname, password } = req.body;

            const dbResponse = await this.userService.create({
                firstname,
                email,
                lastname,
                password,
            });

            res.status(201).json({
                user: dbResponse,
                message: "User registered successfully!",
            });
        } catch (err) {
            const error = createHttpError(501, "User registerion failed");
            next(error);
        }
    }
}
