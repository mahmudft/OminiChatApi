import { createConnection } from "../connection.js"
const mongoose = await createConnection()

const verificationScheme = mongoose.Schema({
    email: { 
        type: String,
        unique: true,
        required: [true, 'email is required']
    },
    code: {
        type: Number,
        required: [true, 'code is required']
    },
})

export const Verification = mongoose.model("Verification", verificationScheme)