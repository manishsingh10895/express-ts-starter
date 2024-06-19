import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import logger from '../helpers/logger';
import NResponse from '../services/response.service';
import { Errors } from '../infra/messages';
import { User } from '../models/user.model';
import { AppError } from '../infra/app-error';
import userService from '../services/user.service';
import { scoop, getParam } from '../helpers';
import requestService, { FindOptions } from '../services/request.service';
export default class UserController {

    constructor() {

    }

    /**
     * Returns full details about the current active user , making the request
     * @param req 
     * @param res 
     */
    public async getCurrentUser(req: Request, res: Response) {
        logger.info("user.controller.getUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS(), _errors.array());
            }

            let id = req.user.id;

            console.log(id)

            let user = await userService.getUserById(id);

            if (!user) {
                throw new AppError(Errors.INVALID_USER());
            }

            return NResponse.OK(res, user.sanitize());
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    public async uploadProfilePic(req: Request, res: Response) {
        logger.info("user.controller.uploadProfilePic");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            if (!req.file) {
                throw new AppError(Errors.INVALID_FILE());
            }

            let path = await userService.uploadProfileImage(req.user.id, req.file);

            return NResponse.OK(res, {
                ...path
            })

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
    * Removes profile image for a user
    * @param req 
    * @param res 
    */
    public async removeProfileImage(req: Request, res: Response) {
        logger.info("policy-owner.controller.removeProfileImage");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            await userService.removeProfileImage(req.user.id);

            return NResponse.OK(res);
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Patches a user
     * @param req 
     * @param res 
     */
    public async patchUser(req: Request, res: Response) {
        logger.info("user.controller.patchUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let body = req.body;
            let userId = req.user.id;

            let updated = await User.findByIdAndUpdate(userId, body);

            return NResponse.OK(res, updated);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    /**
     * Changes password for a user
     */
    public async changePassword(req: Request, res: Response) {
        logger.info("user.controller.changePassword");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let details = scoop(req.body, [
                'oldPassword', 'password', 'confirmPassword'
            ]);

            let changed = await userService.changePassword(req.user.id, details)

            NResponse.OK(res);
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    public async updateUser(req: Request, res: Response) {
        logger.info("user.controller.updateUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let body = scoop(req.body, [
                'firstName',
                'lastName',
                'active',
                'level',
            ]);

            let userId;

            if (req.originalUrl.includes('me')) {
                userId = req.user.id;
            } else {
                userId = getParam('id', req);
            }

            let updated = await User.findByIdAndUpdate(userId, { ...body });

            return NResponse.OK(res, updated);
        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    public async getUsers(req: Request, res: Response) {
        logger.info("user.controller.GetUsers");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.SchemaError(res, Errors.INVALID_REQUEST(), _errors.array());
            }

            let findOptions: FindOptions = requestService.parseFindOptions(req,
                {
                    sort: { field: 'updatedAt', order: -1 },
                    pagination: { skip: 0, limit: 50 },
                }
            );

            let users = await userService.getUsers(findOptions);

            return NResponse.OK(res, users);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }

    public async getUser(req: Request, res: Response) {
        logger.info("user.controller.getUser");
        try {
            let _errors = validationResult(req);
            if (!_errors.isEmpty()) {
                return NResponse.Error(res, Errors.INVALID_CREDENTIALS(), _errors.array());
            }

            let id: string = getParam('id', req);

            let user = userService.getUserById(id);

            if (!user) {
                return NResponse.Error(res, Errors.NOT_FOUND());
            }

            return NResponse.OK(res, user);

        } catch (err) {
            logger.error(err);
            return NResponse.Error(res, Errors.INTERNAL_SERVER_ERROR(), err);
        }
    }
}
export const userController = new UserController();