import { User, IUser, IUserDocument } from "../models/user.model";
import logger from "../helpers/logger";
import { AppError } from "../infra/app-error";
import { Errors } from "../infra/messages";
import TokenService from "./token.service";
import { SignOptions } from "jsonwebtoken";
import { Authenticator } from "./authenticator.service";
import ImageOptimization from "./image-optimization.service";
import { evaluateCountedFindOptions, getAssetURL } from "../helpers";
import countryService from "./country.service";
import { FindOptions } from "./request.service";
import { Roles } from "../infra/roles";
import mailerService from "./mailer.service";


class UserService {

    constructor() {

    }

    /**
     * gets a user by id
     * @param id 
     */
    async getUserById(id: string) {
        logger.info("UserService.getUserById");

        try {
            let user = await User.findOne({ _id: id });

            return user;
        } catch (error) {
            logger.error(error);

            throw error;
        }
    }

    async getUsers(findOptions: FindOptions) {
        logger.info("user.service.getUsers");

        return evaluateCountedFindOptions(findOptions, User, 'users');
    }

    /**
     * Reset password       
     * @param details 
     */
    async resetPassword(token, details) {
        logger.info("user.service.resetPassword");
        try {

            if (details.password !== details.confirmPassword) {
                throw new AppError(Errors.INVALID_REQUEST())
            }

            if (!token) {
                throw new AppError(Errors.INVALID_REQUEST());
            }

            let user = await User.findOne({ resetPasswordToken: token })

            if (!user) {
                throw new AppError(Errors.INVALID_TOKEN())
            }

            user.resetPasswordToken = null;

            user.password = user.hashPassword(details.password)

            let saved = await user.save();

            return saved;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async changePassword(userId: string, details) {
        logger.info("user.service.changePassword");
        try {

            let user = await this.getUserById(userId);

            if (!user) {
                throw new AppError(Errors.INVALID_USER());
            }

            if (user.password != user.hashPassword(details.oldPassword)) {
                throw new AppError(Errors.INVALID_PASSWORD());
            }

            user.password = user.hashPassword(details.password);

            let saved = await user.save();

            return saved;
        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    /**
     * Initialize authenticate for a user
     */
    async initAuthenticator(userId: string) {
        logger.info("user.service.InitAuthenticator");

        let user = await this.getUserById(userId);

        if (!user) {
            throw new AppError(Errors.INVALID_USER());
        }

        try {

            console.log(user.authenticator);

            if (user.authenticator && user.authenticator.verified) {
                throw new AppError(Errors.ALREADY_EXISTS())
            }

            let secret = Authenticator.generateSecret();

            user.authenticator = {
                secret: secret,
                verified: false,
            }

            await user.save();

            let qrcode = await Authenticator.generateQrCode(secret);

            return {
                qrcode,
                secret: secret,
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Finalizes the user's authenticator setup
     * @param userId user
     * @param code code for the authenticator
     */
    async finalizeAuthenticator(userId: string, code: string) {
        logger.info("user.service.finalizeAuthenticator");
        let user = await this.getUserById(userId);

        if (!user) {
            throw new AppError(Errors.INVALID_USER());
        }

        try {
            let secret = user.authenticator.secret.base32;

            let verified = await Authenticator.verify({ secret: secret, token: code })

            if (!verified) throw new AppError(Errors.INVALID_CODE());

            user.authenticator.verified = true;
            user.twoFactorAuthMode = 'authenticator';

            await user.save();

            return verified;

        } catch (err) {
            throw err;
        }
    }


    /**
     * Removes authenticator 2Fa for user   
     * @param userId 
     */
    async removeAuthenticator(userId: string, code: string) {
        logger.info("user.service.removeAuthenticator");
        try {

            let user = await this.getUserById(userId);

            if (!user) {
                throw new AppError(Errors.INVALID_USER());
            }

            let secret = user.authenticator.secret.base32;

            let verified = await Authenticator.verify({ secret: secret, token: code })

            if (!verified) throw new AppError(Errors.INVALID_CODE());

            user.authenticator = null;
            user.twoFactorAuthMode = 'none';

            await user.save();

            return verified;
        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    async uploadProfileImage(userId: string, file: Express.Multer.File) {
        logger.info("user.service.uploadProfileImage");

        try {
            let thumb = await ImageOptimization.createThumbnail(file.filename, file.path);

            const user = await this.getUserById(userId);

            user.profilePic = getAssetURL(file.path);
            user.profilePicThumb = getAssetURL(thumb.path);

            await user.save();

            return {
                profilePic: getAssetURL(file.path),
                profilePicThumb: getAssetURL(thumb.path)
            }
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async removeProfileImage(userId: string) {
        logger.info("user.service.removeProfileImage");
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new AppError(Errors.INVALID_USER());
            }

            user.profilePic = null;
            user.profilePicThumb = null;

            await user.save();
        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    /**
     * Gets a user by email 
     * @param email email of user
     */
    async getUserByEmail(email: string) {
        logger.info("user.service.getUserByEmail");

        try {
            let user = await User.findOne({ email: email })

            return user;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }

    public async generateToken(user: IUser, options?: SignOptions) {
        logger.info("user.service.generateToken");
        let token = await TokenService.sign({
            id: user._id,
            role: Roles.user,
            owner: null,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            level: user.level || 1,
            profilePicThumb: user.profilePic
        }, { expiresIn: 24 * 60 * 60 * 1000, ...options })

        console.log(token);

        return token;
    }

    /**
     * Verifies a using a verification token
     * @param token verification token
     */
    async verifyUser(token: string) {
        logger.info("user.service.verifyUser");
        try {
            if (!token) {
                throw new AppError(Errors.INVALID_TOKEN());
            }

            let { id } = await TokenService.verify(token);

            if (!id) {
                throw new AppError(Errors.INVALID_TOKEN());
            }

            let updated = await User.findOneAndUpdate({ _id: id }, { $set: { verified: true } });

            if (!updated) {
                throw new AppError(Errors.INVALID_CREDENTIALS());
            }

        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    /**
     * Registers a new user 
     * @param details user registration details
     */
    async register(details) {
        logger.info("user.service.register");

        try {
            let user: IUserDocument, token: string;

            user = await this.getUserByEmail(details.email);

            if (user) {
                throw new AppError(Errors.ALREADY_EXISTS());
            }

            if (details.country) {
                details.country = countryService.getCountryDetailsByName(details.country as string)
            }

            user = new User(details);

            this._sendVerificationMail(user);

            let saved = await user.save();

            return saved;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }

    /**
     * Sends a verififcation mail to the provided user
     * @param user
     */
    async _sendVerificationMail(user) {
        const token = await this.generateToken(user, { expiresIn: 24 * 60 * 60 * 1000 });

        await mailerService.sendConfirmation(user.email, user.fullName(), token);
    }

    async getUserAmountInvested() {

    }

    async setupPromo(user: IUserDocument, promo: string) {

    }
}

export default new UserService();
