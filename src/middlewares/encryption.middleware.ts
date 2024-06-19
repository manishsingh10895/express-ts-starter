import { Express, Request, Response } from 'express';
import { Encryption } from "../services/encryption.service";
import logger from '../helpers/logger';

export default class EncryptionMiddleware {
    /**
     * Middleware to decrypt incoming data
     * @param req 
     * @param res 
     * @param next 
     */
    static async decrypt(req: Request, res: Response, next: Function) {
        logger.info("encryption.middleware.decrypt");
        let enc = new Encryption();

        let decrypted = await enc.decryptObject(req.body);

        console.log(decrypted);

        req.body = decrypted;

        next();
    }
}