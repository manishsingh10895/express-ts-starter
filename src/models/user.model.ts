import { Schema, Document, model, Model, Mongoose, Types } from "mongoose";
import Crypto from 'crypto';
import speakeasy from 'speakeasy';
import logger from "../helpers/logger";
import { Roles } from "../infra/roles";

export interface IUserDocument extends Document, IUser {
    _id: any,
}

export interface IUser {
    _id: any,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    salt: string,

    profilePic: string,
    profilePicThumb: string,
    verified: boolean,
    role: Roles.user,
    level: number,
    resetPasswordToken: String,
    country: {
        name: string,
        code: string,
    },
    phone: {
        dialCode: string,
        number: string,
    },
    active: boolean,
    authenticator: {
        secret: speakeasy.GeneratedSecret,
        verified: boolean
    }
    createdAt: Date,
    updatedAt: Date,
    lastLogin: Date | number
    twoFactorAuthMode: 'none' | 'authenticator' | 'phone',
    hashPassword: (plainPass: string) => string,
    fullName: () => string,
    sanitize: () => Partial<IUser>
}

export const UserSchema: Schema = new Schema({
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        default: "user",
        required: true,
    },
    twoFactorAuthMode: {
        type: String,
        enum: ['none', 'authenticator', 'phone'],
        default: 'none'
    },
    authenticator: {
        secret: Object,
        verified: Boolean,
    },
    phone: {
        dialCode: String,
        number: String,
    },
    country: {
        code: String,
        name: String,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
    },
    salt: {
        type: String
    },
    profilePic: {
        type: String
    },
    profilePicThumb: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        default: 1
    },
    resetPasswordToken: String,
    referredBy: {
        type: String,
        index: true
    },
    referred: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    active: { type: Boolean, default: true },
    referralCode: {
        type: String,
        unique: true,
        index: true
    },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
    let self: any = this;

    if (!self.salt) {

        if (self.password && self.password.length >= 4) {

            self.salt = Buffer.from(Crypto.randomBytes(16).toString('base64'), 'base64');
            self.password = self.hashPassword(self.password);
        }
    }

    self.updatedAt = new Date();

    console.log(self.password, self.salt);
    next();
});

UserSchema.pre('updateOne', function () {
    logger.info("user.model.updateOne");
    this.set({ updatedAt: new Date() })
})

UserSchema.pre('findOneAndUpdate', async function (next) {
    logger.info("user.model.findOneAndUpdate");

    this.set({ updatedAt: new Date() })

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
    if (this.salt && password) {
        return Crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
    } else {
        return password;
    }
};

UserSchema.methods.fullName = function () {
    return this.firstName + ' ' + this.lastName;
}

UserSchema.methods.sanitize = function () {
    let x: IUser = this.toObject();

    delete x.password;
    delete x.salt;
    delete x.resetPasswordToken;

    if (x.authenticator && x.authenticator.secret)
        delete x.authenticator.secret;

    return x;
}

export const User: Model<IUserDocument> = model<IUserDocument>('User', UserSchema);