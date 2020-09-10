import config from "../config";
import * as jwt from 'jsonwebtoken';
import { Roles } from "../infra/roles";

export type DecodedUser = {
    role: Roles,
    id: string,
    owner: string,
    children?: string[],
    firstName?: string,
    lastName?: string,
    email: string,
    profilePicThumb?: string,
    level?: number
}

export type UserTokenPayload = DecodedUser;

export default class TokenService {
    /**
     * Sign a new payload, generating a new token
     * @param payload payload to sign 
     * @param options jwt options
     */
    static sign(payload: UserTokenPayload, options: jwt.SignOptions = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, config.JWT_SECRET, options, (err, token) => {
                if (err) {
                    return reject(err);
                }

                return resolve(token);
            })
        })
    }

    /**
     * Verfies the validity of a token
     * @param token token to verify
     * @param options jwt options
     */
    static verify(token: string, options: jwt.VerifyOptions = {}): Promise<UserTokenPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.JWT_SECRET, {}, (err, decoded) => {
                if (err) {
                    reject(err);
                }

                resolve(decoded as DecodedUser);
            })
        })
    }
}