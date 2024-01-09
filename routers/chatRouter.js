import express from "express";
import { User } from "../entities/user.entity.js";
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";

export const chat = express.Router();
////////////////////// DUZEDIM
chat.post("/sendmessage", async (req, res) => {
    // Body{obj.receiverId, obj.content}
    console.log("----------------------------------------------");
    try {
        const obj = req.body;
        const currentUser = await User.findById(req.user.id).populate({
            path: 'chatList',
            match: {
                receiverId: obj.receiverId,
                senderId: req.user.id
            }
        });

        console.log("\n");
        console.log(obj.receiverId);
        const receiverUser = await User.findById(obj.receiverId).populate({
            path: 'chatList',
            match: {
                receiverId: obj.receiverId,
                senderId: req.user.id
            }
        });

        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

        if (!currentUser) {
            console.log("Current User empty");
            return;
        } else if (!receiverUser) {
            console.log("Receiver User empty");
            return;
        }

        console.log("current user chat list \n");
        console.log(currentUser.chatList.length);

        // xetta bunun cagridgi ifinin icersinde idi hele eldim
        const createAndSaveChat = async (user, senderId, receiverId) => {
            const chatldata = await Chat.create({
                receiverId: receiverId,
                senderId: senderId,
                owner: user.id,
                messages: []
            });

            user.chatList.push(chatldata._id);

            await user.save();
            return chatldata;
        };

        if (!currentUser.chatList || currentUser.chatList.length === 0) {

            const chatListData = await createAndSaveChat(currentUser, req.user.id, obj.receiverId);
            currentUser.chatList = [chatListData]; /// xetabunda imis yazdim duzeldi bele tezden beraber edende
        }

        console.log(receiverUser.chatList.length);
        console.log("\nifffffffffffff\n");

        if (!receiverUser.chatList || receiverUser.chatList.length === 0) {
            const chatListData = await createAndSaveChat(receiverUser, req.user.id, obj.receiverId);
            receiverUser.chatList = [chatListData]; /// xeta bunda imis
        }

        console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzSECTION 2zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
        console.log(receiverUser);

        // Now, after ensuring that chat lists are created and saved, proceed to message creation
        const chatIdCurrentUser = currentUser.chatList[0].id;
        const chatIdReceiverUser = receiverUser.chatList[0].id;

        const message = await Message.create({
            content: obj.content,
            receiverId: obj.receiverId,
            senderId: req.user.id,
            chat: chatIdCurrentUser
        });

        const message2 = await Message.create({
            content: obj.content,
            receiverId: obj.receiverId,
            senderId: req.user.id,
            chat: chatIdReceiverUser
        });

        console.log("\n ");
        console.log(receiverUser.chatList[0]);
        // savelerde awaitleri sildim ondan sonra problem hell oldu 
        currentUser.chatList[0].messages.push(message._id);
        receiverUser.chatList[0].messages.push(message2._id);
        // await Promise.all([
        // ]);
        await currentUser.chatList[0].save(),
        await receiverUser.chatList[0].save(),
        await currentUser.save(),
        await receiverUser.save()
        
        console.log(receiverUser.chatList[0].messages);
        console.log("--------- send message section ------");

        return "true";
    } catch (error) {
        console.log(error);
        return error;
    }
});
