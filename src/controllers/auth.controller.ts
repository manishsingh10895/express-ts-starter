import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getParam, scoop } from '../helpers';
import logger from '../helpers/logger';
import { AppError } from '../infra/app-error';
import { Errors } from '../infra/messages';
import { User } from '../models/user.model';
import { Authenticator } from '../services/authenticator.service';
import NResponse from '../services/response.service';
import TokenService from '../services/token.service';
import userService from '../services/user.service';


export default class AuthController {

    tokenService: TokenService;

    constructor() {

    }

    public async Login(req: Request, res: Response) {
        logger.info("auth.controller.Login");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS(), _errors.array());
            }

            let user = await userService.getUserByEmail(req.body.email);

            if (!user) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS());
            }

            if (user.password !== user.hashPassword(req.body.password)) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS());
            }

            if (!user.verified) {
                userService._sendVerificationMail(user);
                throw new AppError(Errors.NOT_VERIFIED());
            }

            if (user.twoFactorAuthMode == 'none') {
                let token = await userService.generateToken(user);

                user.lastLogin = new Date();

                await user.save();

                return NResponse.OK(res, { token: token })
            }

            return NResponse.OK(res, { twoFactorAuthMode: user.twoFactorAuthMode });

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Two factor login, 
     * @param req 
     * @param res 
     */
    public async TwoFactorLogin(req: Request, res: Response) {
        logger.info("auth.controller.TwoFactorLogin");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let details = {
                email: req.body.email,
                password: req.body.password,
                code: req.body.code
            }

            let user = await userService.getUserByEmail(req.body.email);

            if (!user) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS());
            }

            if (user.password !== user.hashPassword(req.body.password)) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS());
            }

            if (user.twoFactorAuthMode == 'authenticator') {
                if (!user.authenticator.verified) {
                    throw new AppError(Errors.NOT_VERIFIED());
                }

                if (!user.authenticator.secret) {
                    throw new AppError(Errors.AUTHENTICATOR_INVALID());
                }

                let verified = Authenticator.verify({ secret: user.authenticator.secret.base32, token: details.code })

                if (!verified) {
                    throw new AppError(Errors.INVALID_CODE());
                }

                let token = await userService.generateToken(user);

                user.lastLogin = new Date();
                await user.save();

                return NResponse.OK(res, { token: token })
            }


            throw new AppError(Errors.INVALID_REQUEST());

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Verify User with a token
     * @param req 
     * @param res 
     */
    public async VerifyUser(req: Request, res: Response) {
        logger.info("auth.controller.VerifyUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let token = getParam('token', req);

            await userService.verifyUser(token);

            return NResponse.RedirectFrontend('login', res);
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Registers a new user
     * @param req
     * @param res
     */
    public async Signup(req: Request, res: Response) {
        logger.info("auth.controller.Signup");
        try {

            const body = req.body;

            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let details = scoop(body, [
                'firstName',
                'lastName',
                'email',
                'promo',
                'country',
                'password',
                'referralCode'
            ])

            let _registered = await userService.register(details);

            return NResponse.Created(res);
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Activates a user 
     * @param req 
     * @param res 
     */
    public async ActivateUser(req: Request, res: Response) {
        logger.info("auth.controller.ActivateUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let updated = await User.findOneAndUpdate({ _id: getParam('id', req) }, {
                active: true
            }, { new: true })

            return NResponse.OK(res, updated);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    public async ResetPassword(req: Request, res: Response) {
        logger.info("auth.controller.ResetPassword");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let token = getParam('token', req);

            let details = {
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            }

            await userService.resetPassword(token, details);

            return NResponse.OK(res);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Deactivates a user
     * @param req 
     * @param res 
     */
    public async DeactivateUser(req: Request, res: Response) {
        logger.info("auth.controller.ActivateUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let remark = req.body.remark;

            let updated = await User.findOneAndUpdate({ _id: getParam('id', req) }, {
                active: false,
                remark: remark
            }, { new: true })

            return NResponse.OK(res, updated);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Users' forgot password request 
     * 
     * @param req 
     * @param res 
     */
    public async ForgotPassword(req: Request, res: Response) {
        logger.info("auth.controller.ForgotPassword");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }



        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Initialize setup for google or any other authenticator
     * @param req 
     * @param res 
     */
    public async InitAuthenticator(req: Request, res: Response) {
        logger.info("auth.controller.SetupAuthenticator");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let userId = req.user.id;

            let data = await userService.initAuthenticator(userId);

            return NResponse.OK(res, {
                secret: data.secret,
                qrcode: data.qrcode
            });

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Finalize the setup for authenticator for a user
     * @param req 
     * @param res 
     */
    public async FinalizeAuthenticator(req: Request, res: Response) {
        logger.info("auth.controller.FinalizeAuthenticator");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let userId = req.user.id;

            let verified = await userService.finalizeAuthenticator(userId, req.body.code);

            return NResponse.OK(res, { verified: verified })

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Removes authenticator and 2FA for user   
     * @param req 
     * @param res 
     */
    public async RemoveAuthenticator(req: Request, res: Response) {
        logger.info("auth.controller.RemoveAuthenticator");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            const userId = req.user.id;

            const code = req.body.code;

            await userService.removeAuthenticator(userId, code);

            return NResponse.OK(res);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }
}

export const authController = new AuthController();
