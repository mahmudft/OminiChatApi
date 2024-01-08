import { createChatKeyHash } from "../authorization/crypt.js";
import { createConnection } from "../connection.js"
import crypto from "crypto";
const mongoose = await createConnection()

const ChatSchema = new mongoose.Schema({
    receiverId: {
      type: String,
      required: [true, 'Receiver ID is required'],
    },
    senderId: {
      type: String,
      required: [true, 'Sender ID is required'],
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [{
      type: Schema.Types.ObjectId,
      ref: 'Message',
    }],
    chatKey: {
      type: String,
      default: createChatKeyHash(crypto.randomBytes(9).toString('hex')),
    },
});

  export const Chat = mongoose.model('Chat', ChatSchema);