import type { Response, Request, NextFunction } from "express";
import { validationResult } from "express-validator";

export function validation(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    next();
}
