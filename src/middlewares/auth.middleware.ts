import TokenService, { DecodedUser, UserTokenPayload } from "../services/token.service";
import logger from "../helpers/logger";
import { Express, Request, Response } from 'express';
import NResponse from "../services/response.service";
import { Errors } from "../infra/messages";
import { AppError } from "../infra/app-error";
import { Roles } from "../infra/roles";

export default class AuthMiddleware {

    static getAccessToken(req: Request): string {
        let headerValue = req.headers['authorization'];

        if (!headerValue) throw new AppError(Errors.UNAUTHORIZED());

        let split = headerValue.split(' ');

        if (!split || split[0] != 'Bearer') {
            throw new AppError(Errors.INVALID_TOKEN_AUTHORIZATION_STRATEGY())
        }

        if (split && split[1]) return split[1];

        throw new AppError(Errors.INVALID_TOKEN());
    }

    /**
     * Middleware, allows only super users to pass through
     * @param req 
     * @param res 
     * @param next 
     */
    static async permeateSuper(req: Request, res: Response, next: Function) {
        logger.info("AuthMiddleware.permeateSuper");
        try {
            let token = AuthMiddleware.getAccessToken(req);

            let decoded = await TokenService.verify(token);

            if (decoded.role != Roles.superadmin) {
                return NResponse.Error(res, Errors.UNAUTHORIZED());
            }

            req.user = decoded;

            next();
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Middleware allows only admin and super users to pass through
     * @param req 
     * @param res 
     * @param next 
     */
    static async permeateAdmin(req: Request, res: Response, next: Function) {
        logger.info("AuthMiddleware.permeateAdmin");
        try {
            let token = AuthMiddleware.getAccessToken(req);
            let decoded: DecodedUser = await TokenService.verify(token);

            if (!decoded) {
                return NResponse.Error(res, Errors.INVALID_TOKEN());
            }

            if (![Roles.admin, Roles.superadmin].includes(decoded.role)) {
                return NResponse.Error(res, Errors.UNAUTHORIZED());
            }

            req.user = decoded;

            next();
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Middleware only allows normal users to pass through, not even admins
     * @param req 
     * @param res 
     * @param next 
     */
    static async permeateUser(req: Request, res: Response, next: Function) {
        logger.info("AuthMiddleware.permeateUser");

        try {
            let token = AuthMiddleware.getAccessToken(req);

            let decoded = await TokenService.verify(token);

            if (!decoded) {
                return NResponse.Error(res, Errors.INVALID_TOKEN());
            }

            if (decoded.role != 'user') {
                return NResponse.Error(res, Errors.UNAUTHORIZED());
            }

            req.user = decoded;

            next();
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Middleware allows all users to pass through with a valid token
     * @param req 
     * @param res 
     * @param next 
     */
    static async permeateAuthenticated(req: Request, res: Response, next: Function) {
        logger.info("AuthMiddleware.permeateUser");

        try {
            let token = AuthMiddleware.getAccessToken(req);

            let decoded = await TokenService.verify(token);

            if (!decoded) {
                return NResponse.Error(res, Errors.INVALID_TOKEN());
            }

            req.user = decoded;

            next();
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Permeates only verfied user to the next action
     */
    static async permeateVerified(req: Request, res: Response, next: Function) {
        logger.info("auth.middleware.permeateVerfied");

        //If user token has been decoded already
        if (req.user) {
            if (req.user.level > 1)
                return next();

            return NResponse.Error(res, Errors.NOT_VERIFIED());
        }

        let token = AuthMiddleware.getAccessToken(req);

        let decoded = await TokenService.verify(token);

        if (!decoded) {
            return NResponse.Error(res, Errors.INVALID_TOKEN());
        }

        if (decoded.level && decoded.level > 1) return next();

        return NResponse.Error(res, Errors.NOT_VERIFIED());
    }

    static async verifyAndValidateToken(req: Request, res: Response): Promise<UserTokenPayload | any> {
        logger.info("auth.middleware.verifyAndValidateToken");
        try {
            let token = AuthMiddleware.getAccessToken(req);
            let decoded: any = await TokenService.verify(token);

            if (!decoded) {
                throw new AppError(Errors.INVALID_TOKEN());
            }

            return decoded as UserTokenPayload;
        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    /**
     * Permeates event non authenticated users
     * sets token and loggedIn user if authenticated request
     * @param req 
     * @param res 
     * @param next 
     */
    static async permeateNonAuthenticated(req: Request, res: Response, next: Function) {
        logger.info("AuthMiddleware.permeateUser");

        try {
            let headerValue = req.headers['authorization'];

            if (!headerValue) return next();

            let token = AuthMiddleware.getAccessToken(req);

            let decoded = await TokenService.verify(token);

            if (!decoded) {
                return NResponse.Error(res, Errors.INVALID_TOKEN());
            }

            req.user = decoded;

            next();
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }
}

