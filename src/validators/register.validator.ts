import { body } from "express-validator";

export const registerValidator = [
    body("firstname")
        .isString()
        .withMessage("First name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .bail()
        .isLength({ min: 3, max: 24 })
        .withMessage("First name must be between 3 and 24 characters"),
    body("lastname")
        .isString()
        .withMessage("Last name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .bail()
        .isLength({ min: 3, max: 24 })
        .withMessage("Last name must be between 3 and 24 characters"),
    body("email")
        .isString()
        .withMessage("Email must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Email must be a valid email address"),
    body("password")
        .isString()
        .withMessage("Password must be a string")
        .bail()
        .notEmpty()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .bail(),
];
