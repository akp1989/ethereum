const crypto = require('crypto'); 


const algorithm = "aes-256-cbc";

export const generateKey = async() =>{

    const securityKey = crypto.randomBytes(32);
    console.log(securityKey.toString('hex'));
    return securityKey.toString('hex');

}

export const encryptDocumentKey = async(documentKey,masterKeyHex) => {
    const initVector = crypto.randomBytes(16);
    const masterKey = Buffer.from(masterKeyHex,'hex');
    const cipher = crypto.createCipheriv(algorithm,masterKey,initVector);
    console.log(initVector);
    let encryptedData = cipher.update(documentKey,'utf-8','hex');
    encryptedData += cipher.final('hex');
    encryptedData = initVector.toString('hex')+encryptedData;
    return encryptedData;
}

export const decryptDocumentKey = async(encrytedDocumentKey,masterKeyHex) => {
    const initVector = Buffer.from(encrytedDocumentKey,'hex');
    const masterKey = Buffer.from(masterKeyHex,'hex');
    const decipher =  crypto.createDecipheriv(algorithm,masterKey,initVector.subarray(0,16));

    let decryptedData = decipher.update(initVector.subarray(16),'hex','utf-8');
    decryptedData += decipher.final('utf-8');
    return decryptedData;
}