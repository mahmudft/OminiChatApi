import { createConnection } from "../connection.js"
const mongoose = await createConnection()

const ChatSchema = new Schema({
    receiverId: {
      type: String,
      required: [true, 'Receiver ID is required'],
    },
    senderId: {
      type: String,
      required: [true, 'Sender ID is required'],
    },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [{
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: [true, 'Messages array is required and cannot be empty'],
    }],
});

  export const Message = mongoose.model('Chat', ChatSchema);