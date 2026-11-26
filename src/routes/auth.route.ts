import { NextFunction, Router, Request, Response } from "express";
import { AuthControllers } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { registerValidator } from "../validators/register.validator";
import { validation } from "../validators/validation";
import { logger } from "../config/logger/logger.config";
import { RefreshToken } from "../entities/RefreshToken";
import { TokenService } from "../services/token.service";
import { privateKey, publicKey } from "../config/key.config";

// connecting blocks
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(
    refreshTokenRepository,
    privateKey,
    publicKey
);
const authcontrollers = new AuthControllers(userService, tokenService, logger);

export const authRoutes: Router = Router();

authRoutes
    .route("/register")
    .post(
        registerValidator,
        validation,
        async (req: Request, res: Response, next: NextFunction) => {
            await authcontrollers.register(req, res, next);
        }
    );
