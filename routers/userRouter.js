import express from "express"
import { User } from "../entities/user.entity.js"
import fs from 'fs';
import { authMiddleware } from "../authorization/middleware.js"
import { createToken, hashPassword, verifyPassword } from "../authorization/crypt.js"
import { Verification } from "../entities/verification.entity.js";
import nodemailer from "nodemailer"
export const user = express.Router()

user.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }
    const verification = await Verification.findOne({ email: email })
    if (verification) {
      await Verification.deleteOne({ email: email });
    }

    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const newVerification = new Verification({
      email: email,
      code: randomNumber
    });
    await newVerification.save();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: 'StepifyVerify@gmail.com',
        pass: 'bafqrxhfmqnvxbsf'
      }
    });

    const mailOptions = {
      from: 'StepifyVerify@gmail.com',
      to: email,
      subject: 'Omini Verification Code',
      text: `${randomNumber} is your verification code`
    };
    await transporter.sendMail(mailOptions);
    console.log("otp code send succesfully")
    return res.status(200).json()
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'An error occurred.' });
  }
})

user.post("/check-otp", async (req, res) => {
  try {
    const { email, code } = req.body
    const verification = await Verification.findOne({ email: email })
    if(!verification){
      return res.status(404).json({error: "Verification code not found"})
    }
    if (verification.code == code) {
      await Verification.deleteOne({ email: email })
      return res.status(200).json()
    }
    return res.status(400).json({error: "Verification code is wrong"})
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'An error occurred.' });
  }
})

user.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    user.password = hashPassword(req.body.password);
    const saved = await user.save();
    await saved.save();
    console.log("succes signup")
    return res.status(200).json(saved);
  } catch (error) {
    console.log(error);

    if (error.name === 'MongoServerError' || error.code === 11000) {
      console.log("duplicate")
      return res.status(400).json({ error: 'This email is already in use.' });
    }

    return res.status(500).json({ error: 'An error occurred.' });
  }
});
// find []
// findOne{}
// user.post("/login", async (req, res)=> {
//     const {password, username} = req.body
//     const user = await User.findOne({username})
//     if(user == null){
//         console.log("No")
//         res.status(404).send("Can not find user")
//     }
//     try {
//         verifyPassword(user.password, password)
//         const token = createToken({id: user._id, username: user.username, email: user.email})
//         return res.status(200).json({token})
//     } catch (error) {
//         return res.status(400).json({message: "error"})
//     }

// })

user.post("/login", async (req, res) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password, password);
    if (isPasswordValid) {
      // Password is valid, create and send token
      const token = createToken({ id: user._id, username: user.username, email: user.email });
      console.log(token);

      return res.status(200).json({ token });
    } else {
      // Password is not valid
      return res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    console.error(error);
    console.log("++++++++++++++++++++++++++++")
    return res.status(500).json({ message: "Internal server error" });
  }
});


// authMiddleware

user.get("/me", authMiddleware, async (req, res) => {
  const user = await User.find({ _id: req.user.id })
  res.send(user)
})