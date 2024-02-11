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
import { authMiddleware } from "./authorization/middleware.js"
// import routers
import { user } from "./routers/userRouter.js"
import { chat } from "./routers/chatRouter.js"
import cookieParser from 'cookie-parser'
import {createServer} from "http"
import { Server } from "socket.io"
config()
const PORT = process.env.PORT

const rateConfig = rateLimit({
    windowMs: 10 * 60 * 5000,
    limit: 100,
    standardHeaders: "draft-6",
    legacyHeaders: false,
    message: "<p>Express many requests</p>"
})


const directory =  path.join(process.cwd(), "uploads")

const upload = multer({dest: directory,
    limits: { fileSize: 10 * 1024 * 1024 }
})

const corsOptions = {
    origin: true,
    credentials: true,
  };

const server = express()

const app = createServer(server)

const io = new Server(app,{
  cookie: true,
  cors: {
    origin: "http://localhost:3000",
    credentials:true
  }
})

io.on('connection', (socket) => {



  socket.on('token', (data) => {
      Console.log("--------------TOKEN_Section----------------")
      const token = data.token;
      console.log(token);
      
  });
});

// io.use((socket, next) => {
//   if (socket.request) {
//     console.log(socket.request.headers.cookie);
//     next();
//   } else {
//     next(new Error("invalid"));
//   }
// });


server.use(cookieParser());
// ** Middlewares **
server.disable("x-powered-by")
server.use(cors(corsOptions));
server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(rateConfig)
server.use(upload.single("file"))
server.use("/chat", authMiddleware);

server.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials"
    );
    next();
  });

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

io.on('connection', (socket) => {
  console.log('a user connected');
});

  
// ** ~ Routers  **

app.listen(PORT, async () => {
    await createConnection()
    console.log(`Server is running: http://localhost:${PORT}`)
})

