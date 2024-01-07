import express from "express"
import { User } from "../entities/user.entity.js"
export const chat = express.Router()

chat.post("/sendmessage", async(req, res)=>{
    const currentUser = await User.findById(req.user.id);
    console.log(currentUser.name);
    
})