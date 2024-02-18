import express from "express";
import { User } from "../entities/user.entity.js";
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";
import { createChatKeyHash, decryptMessage } from "../authorization/crypt.js";


export async function createChat(user, messageOBj= {receiverId: '', content: ''}){
    // Body{obj.receiverId, obj.content}
    let chatkey = null;
    console.log(user.id,messageOBj );
    try {
        const obj = messageOBj;
        const currentUser = await User.findById(user.id).populate({
            path: 'chatList',
            match: {
                usertwo: obj.receiverId,

            }
        });

        console.log(currentUser);
        // console.log(obj.receiverId);
        const receiverUser = await User.findById(messageOBj.receiverId).populate({
            path: 'chatList',
            match: {
                usertwo: user.id,
            }
        });

        console.log(receiverUser);

        // if (!currentUser) {
        //     // console.log("Current User empty");
        //     return {};
        // } else if (!receiverUser) {
        //     // console.log("Receiver User empty");
        //     return {};
        // }

        // console.log("current user chat list \n");
        // console.log(currentUser.chatList.length);


        const createAndSaveChat = async (user, receiverId) => {
            if (chatkey==null) {
                chatkey =  createChatKeyHash();
                // console.log("chatkey \n")
                // console.log(chatkey)
            }
            const chatldata = await Chat.create({
                usertwo: receiverId,
                owner: user.id,
                messages: [],
                chatKey: chatkey
        
            });
            user.chatList.push(chatldata._id);

            await user.save();
            return chatldata;
        };

        if (!currentUser.chatList || currentUser.chatList.length === 0) {

            const chatListData = await createAndSaveChat(currentUser, obj.receiverId);
            currentUser.chatList = [chatListData];
        }

        // console.log(receiverUser.chatList.length);
        // console.log("\nifffffffffffff\n");

        if (!receiverUser.chatList || receiverUser.chatList.length === 0) {
            const chatListData = await createAndSaveChat(receiverUser, req.user.id);
            receiverUser.chatList = [chatListData]; 
        }

        // console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzSECTION 2zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
        // console.log(receiverUser);
        const chatIdCurrentUser = currentUser.chatList[0].id;
        const chatIdReceiverUser = receiverUser.chatList[0].id;
        //let cryptconent = await encryptMessage(messageOBj.content,currentUser.chatList[0].chatKey);
        // console.log("crtype conetent------------")
        // console.log(cryptconent);
        // console.log('====================================');
        //let decrtypy = await decryptMessage(cryptconent,currentUser.chatList[0].chatKey)
        // console.log("decrtypy conetent------------")
        // console.log(decrtypy)
        // console.log('====================================');
        const message = await Message.create({
            content:  messageOBj.content,
            receiverId: obj.receiverId,
            senderId: user.id,
            chat: chatIdCurrentUser
        });

        const message2 = await Message.create({
            content: messageOBj.content,
            receiverId: obj.receiverId,
            senderId: user.id,
            chat: chatIdReceiverUser
        });

        // console.log("\n ");
        // console.log(receiverUser.chatList[0]);
        currentUser.chatList[0].messages.push(message._id);
        receiverUser.chatList[0].messages.push(message2._id);
        // await Promise.all([
        // ]);
        await currentUser.chatList[0].save(),
        await receiverUser.chatList[0].save(),
        await currentUser.save(),
        await receiverUser.save()

        // console.log(receiverUser.chatList[0].messages);
        // console.log("--------- send message section ------");
        let dataobj = message
        dataobj.content  = messageOBj.content;
        return dataobj;
    } catch (error) {
        console.log(error);
        return {};
    }
}