import { config } from "dotenv"
import jwt from "jsonwebtoken"
config()
const SECRET = process.env.TOKEN_SECRET


export function authMiddleware(req, res, next) {
    // const header = req.headers['authorization']
    // const token = header && header.split(" ")[1]   // "Bearer kfjkdsfjkdjfkdsjfkdsjfsdfjsdkfjs"
    let token = req.cookies.authToken;
    // console.log(req.cookies);
    // console.log(`Auth Token ${token}`)

    if (!token) { 
        return res.status(401).send("No Token") 
    }
    else {
        jwt.verify(token, SECRET, (err, user) => {

            if (err) {
                console.log(err)
                console.log("middlware error")
                return res.sendStatus(403)
            }
            req.user = user
            next()
        })
    }
}