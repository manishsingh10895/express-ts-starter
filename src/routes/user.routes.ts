import { Express, Router } from "express";
import UserController, { userController } from "../controllers/user.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import multer from 'multer';
import path from 'path';
import config from "../config";
import userService from "../services/user.service";
import { checkSchema } from "express-validator";
import { ChangePasswordRequestSchema } from "../request-schemas/user.request-schema";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file);

        cb(null, path.resolve(process.cwd() + '/public/' + config.IMAGE.PROFILE_PIC_UPLOAD_DIRECTORY))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    },
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.svg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
})


export default class UserRoute {
    constructor(app: Express) {
        let _router = Router();

        _router.get('/me', AuthMiddleware.permeateAuthenticated, userController.getCurrentUser.bind(userController));

        _router.get('/', AuthMiddleware.permeateAdmin, userController.getUsers.bind(userController))
        _router.get('/:id', AuthMiddleware.permeateAdmin, userController.getUser.bind(userController));

        _router.post('/profilePic', AuthMiddleware.permeateUser, upload.single('profilePic'), userController.uploadProfilePic.bind(userController))
        _router.delete('/profilePic', AuthMiddleware.permeateUser, userController.removeProfileImage.bind(userController));

        _router.patch('/me', AuthMiddleware.permeateUser, userController.patchUser.bind(userController));
        _router.put('/me', AuthMiddleware.permeateUser, userController.updateUser.bind(userController));
        _router.put('/:id', AuthMiddleware.permeateAdmin, userController.updateUser.bind(userController));


        _router.post('/me/changepassword',
            checkSchema(ChangePasswordRequestSchema),
            AuthMiddleware.permeateUser, userController.changePassword.bind(userController));

        app.use('/v1/user', _router);
    }
}