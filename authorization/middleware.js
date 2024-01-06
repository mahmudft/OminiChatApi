import { config } from "dotenv"
import jwt from "jsonwebtoken"
config()
const SECRET = process.env.TOKEN_SECRET


export function authMiddleware(req, res, next){
    const header = req.headers['authorization']
    const token = header && header.split(" ")[1]   // "Bearer kfjkdsfjkdjfkdsjfkdsjfsdfjsdkfjs"
    console.log(`AUTHO______________${token}`)
    console.log(header)
    if(token == null) return res.status(401).send("No Token")
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