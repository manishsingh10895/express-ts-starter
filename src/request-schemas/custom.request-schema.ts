import { Types } from "mongoose";
import { ParamSchema, Schema as ValidationSchema } from "express-validator";

export const validateObjectId = {
    errorMessage: 'Invalid ID',
    options: (value) => {
        return Types.ObjectId.isValid(value);
    }
}

export const validateId: ParamSchema = {
    in: ["params", "query"],
    errorMessage: "invalid id",
    custom: validateObjectId
}


export const ValidIdSchema: ValidationSchema = {
    id: validateId
}