import { createConnection } from "../connection.js"
const mongoose = await createConnection()

const UserAboutScheme = mongoose.Schema({
    receiver: { 
        type: Schema.Types.ObjectId, ref: 'User' ,
        unique: true,
    
    },
    avatar: {
        data: Buffer,
        contentType: String, 
    },
})