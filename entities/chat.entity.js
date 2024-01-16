import { createConnection } from "../connection.js"
const mongoose = await createConnection()

const ChatSchema = new mongoose.Schema({
    usertwo: {
      type: String,
     
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    }],
    chatKey: {
      type: String,
      default: "aaaa",
    },
});

//createChatKeyHash(crypto.randomBytes(9).toString('hex')),

  export const Chat = mongoose.model('Chat', ChatSchema);