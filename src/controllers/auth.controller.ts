import { NextFunction, Response } from "express";
import { UserService } from "../services/user.service";
import { RequestUserData } from "../types";

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
            next(err);
        }
    }
}
