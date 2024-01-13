import { createChatKeyHash } from "../authorization/crypt.js";
import { createConnection } from "../connection.js"
import crypto from "crypto";
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

  export const Chat = mongoose.model('Chat', ChatSchema);