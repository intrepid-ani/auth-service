import { Repository } from "typeorm";
import { Userdata } from "../types";
import { User } from "../entities/User";
import createHttpError from "http-errors";
import { hash } from "bcrypt";
import { AppDataSource } from "../config/db";
import { isHttpError } from "http-errors";

export class UserService {
    constructor(private UserRepository: Repository<User>) {}
    async create({ firstname, lastname, email, password }: Userdata) {
        try {
            const userRepository = AppDataSource.getRepository(User);

            // Check if user already exists
            const userExist = await userRepository.find({
                where: { email: email },
            });
            if (userExist.length > 0) {
                throw createHttpError(422, "Email is already in use", {
                    name: "DUPLICATE_EMAIL",
                    path: "email",
                    location: "body",
                });
            }

            const hashedPassword = await hash(password, 10);

            const user = await this.UserRepository.save({
                email,
                firstname,
                lastname,
                password: hashedPassword,
            });

            return user;
        } catch (err) {
            let error = err;
            if (!isHttpError(err)) {
                const errMsg =
                    err instanceof Error ?
                        err.message
                    :   "Unknown error while registering user";
                error = createHttpError(503, errMsg, {
                    name: "REGISTER_USER_FAILED",
                    path: "",
                    location: "",
                });
            }

            throw error;
        }
    }

    async findById(id: string) {
        try {
            return await this.UserRepository.findBy({ id });
        } catch (err) {
            const errMsg =
                err instanceof Error ?
                    err.message
                :   "Unknown error while finding user";
            throw createHttpError(503, errMsg, {
                name: "CAN_NOT_FIND_USER",
                path: "",
                location: "",
            });
        }
    }

    async findByEmail(email: string) {
        try {
            return await this.UserRepository.findBy({ email });
        } catch (err) {
            const errMsg =
                err instanceof Error ?
                    err.message
                :   "Unknown error while finding user";
            throw createHttpError(503, errMsg, {
                name: "CAN_NOT_FIND_USER",
                path: "",
                location: "",
            });
        }
    }
}
