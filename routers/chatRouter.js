import express from "express"
import { User } from "../entities/user.entity.js"
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";
export const chat = express.Router()

chat.post("/sendmessage", async (req, res)=>{
    
    // Body{obj.receiverId,obj.content}

    let obj = req.body;

    const currentUser = await User.findById(req.user.id).populate({
        path: 'chatList',
        match: {
            receiverId: obj.receiverId,
            senderId: currentUser._id
        }
    });
    const receiverUser = await Use.findById(obj.receiverId).populate({
        path: 'chatList',
        match: {
            receiverId: currentUser._id,
            senderId: obj.receiverId
        }
    });

    if(!currentUser) {
        console.log("Current User empty")
        return;
    }
    else if(!receiverUser){
        console.log("ReceiverUser User empty")
        return;
    }

    if (!currentUser.chatList || currentUser.chatList.length==0) {
        const chatldata = new Chat({
            receiverId: obj.receiverId,
            senderId: currentUser._id,
            owner: currentUser._id
        });

        currentUser.chatList.push(chatldata._id);
        await chatldata.save();
        await currentUser.save();

        
    }

    
    if (!receiverUser.chatList || receiverUser.chatList.length==0) {
        const chatldata = new Chat({
            receiverId: obj.receiverId,
            senderId: currentUser._id,
            owner: receiverUser._id
        });
        receiverUser.chatList.push(chatldata._id);
        await chatldata.save();
        await receiverUser.save();

    }

    const message = new Message({
        content: obj.content,
        receiverId: obj.receiverId,
        senderId: currentUser._id,
        chat: currentUser.chatList[0].id
    });

    
    const message2 = new Message({
        content: obj.content,
        receiverId: obj.receiverId,
        senderId: currentUser._id,
        chat: receiverUser.chatList[0].id
    });

    console.log("receiverUser.chatList[0]\t",receiverUser.chatList[0])

    currentUser.chatList[0].messages.push(message);
    receiverUser.chatList[0].messages.push(message2);
    await message.save();
    await message2.save();
    await currentUser.save();
    await receiverUser.save();

    console.log(receiverUser.name);
    console.log(currentUser.name);
    console.log("--------- send message section ------");
    console.log(obj);
    
})