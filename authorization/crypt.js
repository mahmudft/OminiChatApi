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

// export async function messageCryption(message,key) {
//     try {
//         const hash = jwt.sign({message},key,{algorithm: 'HS512'})
//         return hash;

//     } catch (error) {
//         console.error('Hash creation failed:', error.message);
//         throw error;
//     }
// }



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
    return jwt.verify(hashedpassword, PASSWORD_SECRET, (err, paswd) => {
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
    const decodedToken = jwt.decode(key);
    
    const keyt = crypto.createHash('sha256').update(decodedToken.key).digest('hex').slice(0, 32);

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', keyt, iv);

    let encryptedMessage = cipher.update(message, 'utf-8', 'hex');
    encryptedMessage += cipher.final('hex');

    return encryptedMessage;
}

// export async function encryptMessage(message, key) {

//     console.log("my sectionn------------")
//     console.log(message);
//     console.log(key);
//     // Generate a random Initialization Vector (IV)
//     const iv = crypto.randomBytes(16);
    
//     // Create a cipher with AES-256-CBC algorithm, using the key and IV
//     const cipher = await crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    
//     // Encrypt the message
//     let encryptedMessage = await cipher.update(message, 'utf-8', 'hex');
//     encryptedMessage += await cipher.final('hex');
    
//     // Return an object containing the encrypted message and IV
//     return {
//         encryptedMessage,
//         iv: iv.toString('hex')
//     };
// }

// export async function decryptMessage(encryptedMessage, key) {
//     const decipher = await crypto.createDecipheriv('aes-256-cbc', key);
//     let decryptedMessage =await  decipher.update(encryptedMessage, 'hex', 'utf-8');
//     decryptedMessage += await decipher.final('utf-8');
//     return decryptedMessage;
// }

export async function decryptMessage(encryptedMessage, key) {
    const decodedToken = jwt.decode(key);

    // Ensure that the key has the correct length (32 bytes for AES-256-CBC)
    const keyt = crypto.createHash('sha256').update(decodedToken.key).digest('hex').slice(0, 32);

    // The initialization vector should be stored or transmitted along with the encrypted message
    // For simplicity, assuming you have stored the iv as a hex string in the beginning of the encrypted message
    const iv = Buffer.from(encryptedMessage.slice(0, 32), 'hex');
    const encryptedText = encryptedMessage.slice(32);

    // Create a decipher using the algorithm, key, and iv
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyt, iv);

    // Update and finalize the decipher
    let decryptedMessage = decipher.update(encryptedText, 'hex', 'utf-8');
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