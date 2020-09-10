import { Express, Router } from "express";
import AuthController, { authController } from "../controllers/auth.controller";
import { checkSchema } from "express-validator";
import { SignupRequestSchema, LoginRequestSchema, VerifyRequestSchema, ForgotRequestSchema, ResetPasswordRequestSchema, InitAuthenticatorRequestSchema, FinalizeAuthenticatorRequestSchema, TwoFactorLoginRequestSchema, RemoveAuthenticatorRequestSchema } from "../request-schemas/auth.request-schema";
import { ValidIdSchema } from "../request-schemas/custom.request-schema";
import AuthMiddleware from "../middlewares/auth.middleware";
import EncryptionMiddleware from "../middlewares/encryption.middleware";
export default class AuthRoute {
    constructor(app: Express) {
        let _router = Router();

        _router.post('/login', EncryptionMiddleware.decrypt, checkSchema(LoginRequestSchema), authController.Login.bind(authController));
        _router.post('/login/2fa', EncryptionMiddleware.decrypt, checkSchema(TwoFactorLoginRequestSchema), authController.TwoFactorLogin.bind(authController));

        _router.post('/signup', EncryptionMiddleware.decrypt, checkSchema(SignupRequestSchema), authController.Signup.bind(authController));

        _router.post('/forgotpassword', checkSchema(ForgotRequestSchema), authController.ForgotPassword.bind(authController))

        _router.get('/verify/:token', checkSchema(VerifyRequestSchema), authController.VerifyUser.bind(authController))

        _router.post('/resetpassword', EncryptionMiddleware.decrypt, checkSchema(ResetPasswordRequestSchema), authController.ResetPassword.bind(authController))

        _router.post('/authenticator/init', AuthMiddleware.permeateUser, checkSchema(InitAuthenticatorRequestSchema), authController.InitAuthenticator.bind(authController));
        _router.post('/authenticator/finish', AuthMiddleware.permeateUser, checkSchema(FinalizeAuthenticatorRequestSchema), authController.FinalizeAuthenticator.bind(authController));
        _router.post('/authenticator/remove', checkSchema(RemoveAuthenticatorRequestSchema), AuthMiddleware.permeateUser, authController.RemoveAuthenticator.bind(authController));


        _router.post('/:id/activate', AuthMiddleware.permeateAdmin, checkSchema(ValidIdSchema), authController.ActivateUser.bind(authController));
        _router.post('/:id/deactivate', AuthMiddleware.permeateAdmin, checkSchema(ValidIdSchema), authController.DeactivateUser.bind(authController));

        app.use('/v1/auth', _router);
    }
}

