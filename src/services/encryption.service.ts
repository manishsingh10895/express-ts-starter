import fs from 'fs';
import NodeRSA from 'node-rsa';
import logger from '../helpers/logger';

export class Encryption {

    publicKey;
    privateKey;

    constructor() {
        this._initKeys();
    }

    async _initKeys() {
        if (this.publicKey && this.privateKey) return;
        this.publicKey = fs.readFileSync('public_key.pem');
        this.privateKey = fs.readFileSync('private_key.pem');
    }

    encrypt(data) {

    }

    async decrypt(data) {
        logger.info("encryption.service.decrypt");

        if (!this.publicKey) {
            await this._initKeys();
        }

        let key = new NodeRSA({ b: 512 });

        let x = key.importKey(this.privateKey);

        let decrypted = x.decrypt(data, "base64");

        return decrypted;
    }

    async decryptObject(data) {
        logger.info("encryption.service.decryptObject");

        if (!this.publicKey) {
            await this._initKeys();
        }

        let key = new NodeRSA({ b: 512 });

        let x = key.importKey(this.privateKey);

        let decrypted = {};

        Object.keys(data).forEach(k => {
            decrypted[k] = x.decrypt(data[k], 'utf8');
        })

        return decrypted;
    }
}

export default new Encryption();