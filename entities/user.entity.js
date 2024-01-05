import { createConnection } from "../connection.js"
const mongoose = await createConnection()
const UserScheme = mongoose.Schema({
    name:{
        type: String,
        minLength: 3,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        unique: true,
        minLength: 6,
        validate: {
            validator: function(e){
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(e)
            },
            message: props => `Can not validate ${props.value}`
        },
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        minLength: 4,
        required: [true, "Password is required"]
    },
    chatList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    role:{
        type: String,
        minLength: 2,
        default: 'abstract',
        required: [true, "Role is required"]
    }

}, {
    timestamps: true,
    toJSON: {virtuals: true}
});


export const User = mongoose.model("User", UserScheme)
