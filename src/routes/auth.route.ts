import { NextFunction, Router, Request, Response } from "express";
import { AuthControllers } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { registerValidator } from "../validators/register.validator";
import { validation } from "../validators/validation";

// connecting blocks
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authcontrollers = new AuthControllers(userService);

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
