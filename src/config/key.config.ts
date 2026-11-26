import fs from "node:fs";
import { createPrivateKey, createPublicKey } from "node:crypto";
import path from "node:path";

export const privateKey = createPrivateKey(
    fs.readFileSync(path.resolve(process.cwd(), "./certs/private.pem"))
);

export const publicKey = createPublicKey(
    fs.readFileSync(path.resolve(process.cwd(), "./certs/public.pem"))
);
