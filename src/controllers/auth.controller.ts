import { NextFunction, Response } from "express";
import { UserService } from "../services/user.service";
import { RequestUserData } from "../types";
import { Logger } from "winston";
import { TokenService } from "../services/token.service";
import { env } from "../config/env.config";
import { DayInMiliSec } from "../constants";

export class AuthControllers {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private logger: Logger
    ) {}

    async register(req: RequestUserData, res: Response, next: NextFunction) {
        try {
            const { email, firstname, lastname, password } = req.body;

            const dbResponse = await this.userService.create({
                firstname,
                email,
                lastname,
                password,
            });

            this.logger.info("New user registered!", {
                UserName: firstname + " " + lastname,
                email: email,
            });

            const accessToken = this.tokenService.generateAccess({
                id: dbResponse.id,
                role: dbResponse.role,
            });
            const refreshTokenRecord = await this.tokenService.createRefresh();
            const refreshToken = this.tokenService.generateRefresh({
                tokenId: refreshTokenRecord.id,
            });

            res.cookie("accessToken", accessToken, {
                domain: env.DOMAIN,
                httpOnly: true,
                sameSite: "strict",
                maxAge: DayInMiliSec / 24,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: env.DOMAIN,
                httpOnly: true,
                sameSite: "strict",
                maxAge: DayInMiliSec * 7,
            });

            res.status(201).json({
                user: dbResponse,
                message: "User registered successfully!",
                tokens: {
                    accessToken,
                    refreshToken,
                },
            });
        } catch (err) {
            next(err);
        }
    }
}
