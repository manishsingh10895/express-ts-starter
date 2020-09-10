import { IMessage, FMessage } from "./messages";

export class AppError extends Error {

    name: string = 'AppError';

    error: IMessage;

    constructor(error?: IMessage) {
        super(error.msg);
        this.message = error.msg;

        this.error = error;
    }
}