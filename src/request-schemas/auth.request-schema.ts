import { checkSchema, ValidationSchema } from 'express-validator';
import { Errors } from '../infra/messages';
import { PASSWORD_REGEX } from '../constants';

export const LoginRequestSchema: ValidationSchema = {
    email: {
        isEmail: true,
        isEmpty: {
            negated: true,
        },
    },
    password: {
        isLength: {
            options: {
                min: 6
            }
        }
    }
}

export const RemoveAuthenticatorRequestSchema: ValidationSchema = {
    code: {
        isEmpty: {
            negated: true,
        }
    }
}

export const TwoFactorLoginRequestSchema: ValidationSchema = {
    email: {
        isEmail: true,
        isEmpty: {
            negated: true,
        },
        errorMessage: Errors.INVALID_EMAIL,
    },
    password: {
        isLength: {
            options: {
                min: 6
            }
        }
    },
    code: {
        isString: true,
        notEmpty: true,
    }
}

export const ResetPasswordRequestSchema: ValidationSchema = {
    password: {
        matches:
        {
            options: PASSWORD_REGEX
        },
        notEmpty: {

        }
    },
    confirmPassword: {
        matches:
        {
            options: PASSWORD_REGEX
        },
        notEmpty: true
    },
    token: {
        in: ['params', 'query']
    }
}

export const FinalizeAuthenticatorRequestSchema: ValidationSchema = {
    code: {
        isString: true,
        isEmpty: {
            negated: true,
        },
        isLength: {
            options: {
                min: 6,
                max: 6
            }
        },
    }
}

export const InitAuthenticatorRequestSchema: ValidationSchema = {

}

export const ForgotRequestSchema: ValidationSchema = {
    email: {
        isEmail: true,
        isEmpty: {
            negated: true,
        }
    }
}

export const SignupRequestSchema: ValidationSchema = {
    email: {
        isEmail: true,
        isEmpty: {
            errorMessage: "Email can't be empty",
            negated: true,
        },
        errorMessage: Errors.INVALID_EMAIL,
    },
    firstName: {
        isLength: {
            options: {
                min: 3
            }
        },
        trim: true,
        exists: true,
    },
    password: {
        matches: {
            options: PASSWORD_REGEX
        },
        errorMessage: Errors.INVALID_PASSWORD,
        exists: true,
    }
}

export const VerifyRequestSchema: ValidationSchema = {
    token: {
        in: ['params', 'query'],
        exists: true,
    }
}