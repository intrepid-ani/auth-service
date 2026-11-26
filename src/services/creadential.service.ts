import { compare } from "bcrypt";
export class CredentialServices {
    async verify(unHashed: string | Buffer, hashed: string) {
        return await compare(unHashed, hashed);
    }
}
