import { createConnection } from "../connection.js"
const mongoose = await createConnection()

const MessageSchema = new Schema({
    content: {
      type: String,
      minLength: 1,
      required: [true, 'Content is required'],
    },
    dateTime: String,
    receiverId: {
      type: String,
      required: [true, 'Receiver ID is required'],
    },
    senderId: {
      type: String,
      required: [true, 'Sender ID is required'],
    },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
    hasSeen: { type: Boolean, default: false },
  });
  
export const Message = mongoose.model('Message', MessageSchema);