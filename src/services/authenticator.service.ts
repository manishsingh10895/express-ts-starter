import speakeasy from 'speakeasy';
import QrCode from 'qrcode';
import config from '../config';

export class Authenticator {
    static generateSecret(): speakeasy.GeneratedSecret {
        return speakeasy.generateSecret({ name: config.APP_NAME, length: 12 })
    }

    /**
     * Generates a qr code image data for a secret
     * @param secret 
     */
    static async generateQrCode(secret: speakeasy.GeneratedSecret) {
        try {
            let imageData = await QrCode.toDataURL(secret.otpauth_url)

            return imageData;
        } catch (err) {
            throw err;
        }
    }

    static generateTOTP(base32Secret) {

        return speakeasy.totp({
            secret: base32Secret,
            encoding: 'base32',
        })
    }

    static verify(option: { secret: string, token: string }) {
        return speakeasy.totp.verify({
            secret: option.secret,
            token: option.token,
            encoding: 'base32'
        })
    }
}