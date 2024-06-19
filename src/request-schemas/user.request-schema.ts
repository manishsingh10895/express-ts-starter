import { Schema as ValidationSchema } from "express-validator";
import { PASSWORD_REGEX } from "../constants";
import { Errors } from "../infra/messages";

export const ChangePasswordRequestSchema: ValidationSchema = {
    oldPassword: {
        isEmpty: {
            negated: true,
        },
    },
    password: {
        matches: {
            options: PASSWORD_REGEX
        },
        errorMessage: Errors.INVALID_PASSWORD,
        exists: true,
    }
}
