import express from "express"
import { User } from "../entities/user.entity.js"
export const request = express.Router()

request.post("/sendfollow", async(req, res)=>{
    const currentUser = await User.findById(req.user.id);
    console.log(currentUser.name);
    
})