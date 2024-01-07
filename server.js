import express from "express"
import { config } from "dotenv"
import parser from "body-parser"
import path from "path"
import {rateLimit} from "express-rate-limit"
import { createConnection } from "./connection.js"
import cors from 'cors';
import mongoose from "mongoose";
import multer from "multer"
import fs from 'fs';
import { authMiddleware } from "../authorization/middleware.js"
// import routers
import { user } from "./routers/userRouter.js"
import { chat } from "./routers/chatRouter.js"

config()
const PORT = process.env.PORT

const rateConfig = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-6",
    legacyHeaders: false,
    message: "<p>Express many requests</p>"
})


const directory =  path.join(process.cwd(), "uploads")

const upload = multer({dest: directory,
    limits: { fileSize: 10 * 1024 * 1024 }
})



const server = express()

// ** Middlewares **
server.disable("x-powered-by")
server.use(cors());
server.use(rateConfig)
server.use(upload.single("file"))
server.use(parser.urlencoded({extended: false}))
server.use(express.json())
server.use("/chat", authMiddleware);
// ** ~ Middlewares **

// ** Routers  **

server.use("/user", user)
server.use("/chat", chat)
server.use("/", user)


server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

  
// ** ~ Routers  **

server.listen(PORT, async () => {
    await createConnection()
    console.log(`Server is running: http://localhost:${PORT}`)
})

