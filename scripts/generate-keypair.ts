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