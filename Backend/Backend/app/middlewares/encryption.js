//Checking the crypto module
const crypto = require('crypto');
require("dotenv").config();

const { SECRET_KEY, SECRET_IV, ENCRYPTION_METHOD } = process.env
if (!SECRET_KEY || !SECRET_IV || !ENCRYPTION_METHOD) {
   throw new Error('secretSECRET_KEY, secretIV, and ecnryptionMethod are required')
}

//Encrypting text
function encryptData(text) {
   let cipher = crypto.createCipheriv(ENCRYPTION_METHOD, Buffer.from(SECRET_KEY), SECRET_IV);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return encrypted.toString('hex');
}

// Decrypting text

function decryptData(encryptedData) {
   let iv = Buffer.from(encryptedData, 'hex');
   let encryptedText = Buffer.from(encryptedData, 'hex');
   let decipher = crypto.createDecipheriv(ENCRYPTION_METHOD, Buffer.from(SECRET_KEY), SECRET_IV);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}

module.exports = { encryptData, decryptData};
