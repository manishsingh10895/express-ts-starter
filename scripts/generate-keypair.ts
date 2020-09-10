// import { generateKeyPairSync } from 'crypto';

// let keyPair = generateKeyPairSync('ec', {
//     namedCurve: 'P-256',
// })

// let _public = keyPair.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');

// let _private = keyPair.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex');

// console.log("Public");
// console.log(_public);

// console.log("private");
// console.log(_private);

import RSA from 'node-rsa';
import fs from 'fs';


const key = new RSA({ b: 512 });

let keypair = key.generateKeyPair();

const publicDer = key.exportKey('pkcs8-public-pem');
const privateDer = key.exportKey('pkcs8-private-pem');

console.log(publicDer);
console.log(privateDer);


fs.writeFileSync('private_key.pem', privateDer);

fs.writeFileSync('public_key.pem', publicDer);