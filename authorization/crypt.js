import { config } from "dotenv"
import jwt from "jsonwebtoken"
import crypto from 'crypto';
config()
const SECRET = process.env.TOKEN_SECRET
const PASSWD_SECRET = process.env.PASSWORD_SECRET

export function createToken(user){
    return jwt.sign(user, SECRET, {expiresIn: "250h", algorithm: "HS512"})
}

export function hashPassword(password){
    return jwt.sign(password, PASSWD_SECRET)
}

export function verifyPassword(hashedpassword, password){
    return jwt.verify(hashedpassword, PASSWD_SECRET, (err, paswd) => {
        console.log("------------")
        console.log(paswd)
        console.log("------------")
        if(password != paswd){
            throw Error("Password didnt match")
        }else {
            return true
        }
      })
}


export function generateSharedCode(userid, folderid) {
    const combinedString = userid.toString() +"_"+ folderid.toString();
    // You can use a hashing algorithm (e.g., SHA-256) or encoding (e.g., Base64) based on your requirements
    const hash = crypto.createHash('sha256').update(combinedString).digest('hex');
    console.log(`\n ----------genereSharedCode-------\n`)
    console.log(hash);
    return hash;
}