export const Success = {

}


export type FMessage = (...args: string[]) => IMessage

export const Errors = {
    UNAUTHORIZED: (() => ({ msg: 'Unauthorized request', code: 403, status: 403, })) as FMessage,
    UNAUTHENTICATED: () => ({ msg: 'Unauthenticated request', code: 403, status: 403, }),
    UNAUTHORIZED_TO_PERFORM_ACTION: () => ({
        msg: "You are unauthorized to perform this action, you might be accessing a resource that doesn't belong to you, Check if you are logged in as another ROLE",
        code: 4001,
        status: 400,
    }),
    CUSTOM: (msg: string, code?: number, status?: number) => ({ msg: msg, code: code || 400, status: status || 400 }),
    //When can't add another document to a mongoose model
    NO_MORE_MODEL: (model: string) => ({ msg: `NO more ${model}s allowed` }),
    INVALID_REQUEST: () => ({ msg: 'Invalid request', code: 400, status: 400, }),
    UNKNOWN_ERROR: (() => ({ msg: 'Unknown error', code: 400, status: 400, })) as FMessage,
    INVALID_TOKEN_AUTHORIZATION_STRATEGY: () => ({ msg: 'Invalid authorization strategy', code: 401, status: 401, }),
    NOT_FOUND: () => ({ msg: 'Not found', code: 400, status: 404, }),
    ALREADY_EXISTS: (model?: string) => ({ msg: ``, code: 400, status: 400, }),
    INVALID_TOKEN: () => ({ msg: "Invalid token", code: 400, status: 400, }),
    INVALID_CREDENTIALS: () => ({ msg: "Invalid login credentials", code: 400, status: 400, }),
    ACCOUNT_NOT_ACTIVE: () => ({ msg: "Account not active", code: 105, status: 400, }),
    INVALID_EMAIL: () => ({ msg: "Provided email is invalid", code: 400, status: 400, }),
    INVALID_PASSWORD: () => ({ msg: "Password should container 1 capital, 1 special character and 1 number", code: 400, status: 400, }),
    PASSWORD_DONT_MATCH: () => ({ msg: "Passwords don't match", code: 400, status: 400, }),
    INVALID_OPERAND: () => ({ msg: "Invalid operand in a math operation", code: 500, status: 500, }),
    INTERNAL_SERVER_ERROR: (() => ({ msg: "Internal server error", code: 500, status: 500, })) as FMessage,
    INVALID_USER: () => ({ msg: "Invalid User", code: 400, status: 400, }),
    DUPLICATE_ENTRY: () => ({ msg: "Duplicate Entry", code: 400, status: 400 }),
    AUTHENTICATOR_INVALID: () => ({ msg: "Authenticator not setup correctly", code: 400, status: 400, }),
    NOT_VERIFIED: (model?: string) => ({ msg: `${model} Not verified`, code: 400, status: 400, }),
    INVALID_FILE: () => ({ msg: "Invalid file", code: 400, status: 400 }),
    INVALID_CODE: () => ({ msg: "Invalid Code", code: 400, status: 400, }),
}

export type Message = {
    msg: string,
    code: number,
    status: number,
}

export type IMessage = Message; 