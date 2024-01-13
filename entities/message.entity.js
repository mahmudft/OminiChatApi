import { createConnection } from "../connection.js"

const mongoose = await createConnection()

const MessageSchema = new mongoose.Schema({
    content: {
      type: String,
      minLength: 1,
      required: [true, 'Content is required'],
    },
    receiverId: {
      type: String,
      required: [true, 'Receiver ID is required'],
    },
    senderId: {
      type: String,
      required: [true, 'Sender ID is required'],
    },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    hasSeen: { type: Boolean, default: false },
    encrypted: {
      type: Boolean,
      default: true,
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
  });
  
export const Message = mongoose.model('Message', MessageSchema);