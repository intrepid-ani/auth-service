import { Repository } from "typeorm";
import { Userdata } from "../types";
import { User } from "../entities/User";
import createHttpError from "http-errors";
import { hash } from "bcrypt";

export class UserService {
    constructor(private UserRepository: Repository<User>) {}
    async create({ firstname, lastname, email, password }: Userdata) {
        try {
            const hashedPassword = await hash(password, 10);

            const user = await this.UserRepository.save({
                email,
                firstname,
                lastname,
                password: hashedPassword,
            });

            return user;
        } catch (err) {
            if (err instanceof Error) {
                const error = createHttpError(503, err.message);
                throw error;
            }
        }
    }
}
