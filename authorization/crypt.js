import { config } from "dotenv"
import jwt from "jsonwebtoken"
import crypto from 'crypto';
config()
const SECRET = process.env.TOKEN_SECRET
const PASSWORD_SECRET = process.env.PASSWORD_SECRET
const CHAT_KEY = process.env.CHAT_KEY
export function createToken(user) {
    return jwt.sign(user, SECRET, { expiresIn: "48h", algorithm: "HS512" })
}

export function hashPassword(password) {
    return jwt.sign(password, PASSWORD_SECRET)
}



export async function createChatKeyHash(key) {
    try {
        const hash = jwt.sign({ key }, CHAT_KEY, { algorithm: 'HS512' });
        console.log(hash)
        return hash;
    } catch (error) {
        console.error('Hash creation failed:', error.message);
        throw error;
    }
}

export async function verifyChatKeyHash(hash) {
    try {
        const decoded = jwt.verify(hash, CHAT_KEY, { algorithms: ['HS512'] });
        console.log(decoded,"verifyChatKeyHash function")
        return decoded.key;
    } catch (error) {
        console.error('Hash verification failed:', error.message);
        throw error;
    }
}

export function verifyPassword(hashedpassword, password) {
    return jwt.verify(hashedpassword, PASSWD_SECRET, (err, paswd) => {
        console.log("------------")
        console.log(paswd)
        console.log("------------")
        if (password != paswd) {
            throw Error("Password didnt match")
        } else {
            return true
        }
    })
}

export async function encryptMessage(message, key) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key);
    let encryptedMessage = cipher.update(message, 'utf-8', 'hex');
    encryptedMessage += cipher.final('hex');
    return encryptedMessage;
}

export async function decryptMessage(encryptedMessage, key) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key);
    let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8');
    decryptedMessage += decipher.final('utf-8');
    return decryptedMessage;
}


export function generateSharedCode(userid, folderid) {
    const combinedString = userid.toString() + "_" + folderid.toString();
    // You can use a hashing algorithm (e.g., SHA-256) or encoding (e.g., Base64) based on your requirements
    const hash = crypto.createHash('sha256').update(combinedString).digest('hex');
    console.log(`\n ----------genereSharedCode-------\n`)
    console.log(hash);
    return hash;
}