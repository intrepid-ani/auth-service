import createHttpError from "http-errors";
import { RefreshToken } from "../entities/RefreshToken";
import { JwtPayload, sign } from "jsonwebtoken";
import { env } from "../config/env.config";
import { KeyObject } from "node:crypto";
import { Repository } from "typeorm";

type SigningKey = string | KeyObject;

export class TokenService {
    constructor(
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly privateKey: SigningKey,
        private readonly publicKey: SigningKey
    ) {}

    generateAccess(payload: Record<string, string | number>): string {
        if (typeof this.privateKey === "string" && !this.privateKey.trim())
            throw createHttpError(500, "Can't read the private key.");

        const accessToken = sign(payload, this.privateKey, {
            algorithm: "RS256",
        });

        return accessToken;
    }

    generateRefresh(payload: JwtPayload | string) {
        if (!env.JWT_SECRET)
            throw createHttpError(500, "Can't read the refresh-token secret.");

        const refreshToken = sign(payload, env.JWT_SECRET, {
            algorithm: "HS256",
        });

        return refreshToken;
    }

    async createRefresh(): Promise<RefreshToken> {
        return this.refreshTokenRepository.save({});
    }
}
