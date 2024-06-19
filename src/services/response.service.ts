import { Express, Response } from 'express';
import { IMessage, Errors } from '../infra/messages';
import { AppError } from '../infra/app-error';
import config from '../config';
import { Result, ValidationError } from 'express-validator';

export default class NResponse {
    static OK(res: Response, data: any = { success: true }) {
        res.json({ success: true, data });
    }

    static Created(res: Response, data?: any) {
        return res.status(201).json({
            success: true,
            data,
        });
    }

    static Success(res: Response, message: IMessage, data: any, description: string = "") {
        res.status(message.code)
            .json({
                success: true,
                message: message.msg,
                data: data,
                status: {
                    code: message.code,
                    description: description || message.msg,
                }
            })
    }

    static RedirectFrontend(page: string, res: Response, query?: string,) {
        const PageDirectory = {
            'login': '/auth/login',
            'home': '/',
            'signup': '/auth/signup'
        }

        return res.redirect(config.APP_URL + (PageDirectory[page] || PageDirectory.home) + `${query ? '?' + query : ''}`);
    }

    static Unauthorized(res: Response) {
        res.status(401)
            .json({
                success: false,
                message: Errors.UNAUTHORIZED,
                data: [],
                status: {
                    code: 401,
                    description: Errors.UNAUTHORIZED
                }
            })
    }

    static Error(res: Response, message: IMessage, errors: any = "") {

        let description = errors.message;

        ///If error passed is a custome life error
        // then override the default error message ((IMesssage))
        if (errors && errors.name && errors.name == 'AppError') {

            message = (errors as AppError).error;

            description = (errors as AppError).message;
        }

        if (errors && errors.name && errors.name == 'JsonWebTokenError') {
            message = {
                msg: errors.message || "Invalid Token",
                code: 401,
                status: 401,
            }

            description = (errors.message);
        }

        res.status(message.status || 500)
            .json({
                success: false,
                message: message.msg,
                data: [],
                status: {
                    code: message.code,
                    description
                }
            })
    }

    /**
     * 
     * Normalize and return 
     * 
     * @param res 
     * @param message 
     * @param errors express validators schema errors
     */
    static SchemaError(res: Response, message: IMessage, errors: ValidationError[] | string[]) {

        function getMessage(error) {
            if (typeof error == 'string') return error;
            if (typeof error.msg == 'string') return error.msg;

            return getMessage(error.msg);
        }

        console.log(errors);

        let error = errors[0];

        res.status(message.status || 400)
            .json({
                success: false,
                message: error ? getMessage(error) : Errors.INTERNAL_SERVER_ERROR().msg,
                data: [],
                status: {
                    code: message.code,
                    description: errors,
                }
            })

    }
}