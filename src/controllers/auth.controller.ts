import { NextFunction, Response } from "express";
import { UserService } from "../services/user.service";
import { RequestUserData, RequestLoginData } from "../types";
import { Logger } from "winston";
import { TokenService } from "../services/token.service";
import { env } from "../config/env.config";
import { DayInMiliSec } from "../constants";
import createHttpError from "http-errors";
import { CredentialServices } from "../services/creadential.service";

export class AuthControllers {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private logger: Logger,
        private credentialService: CredentialServices
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
            const refreshTokenRecord = await this.tokenService.createRefresh(
                dbResponse.id
            );
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

    async login(req: RequestLoginData, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const user = await this.userService.findByEmail(email);

            if (user.length == 0) {
                throw createHttpError(400, "Invalid email and password");
            }

            const isPasswordCorrect = await this.credentialService.verify(
                password,
                user[0].password
            );

            if (!isPasswordCorrect) {
                throw createHttpError(400, "Invalid email and password");
            }

            const accessToken = this.tokenService.generateAccess({
                id: user[0].id,
                role: user[0].role,
            });
            const refreshTokenRecord = await this.tokenService.createRefresh(
                user[0].id
            );
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

            res.status(200).json({
                user: user[0],
                message: "Successfully logged in",
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
