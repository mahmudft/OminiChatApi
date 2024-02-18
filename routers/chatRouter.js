import express from "express";
import { User } from "../entities/user.entity.js";
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";
import crypto from "crypto";
import { createChatKeyHash, encryptMessage , decryptMessage } from "../authorization/crypt.js";
export const chat = express.Router();

////// FUNCTION

async function CheckUser(userid) {
    return new Promise(async (resolve) => {
        try {
            setTimeout(async () => {
                const user = await User.findById(userid);
              

                resolve(!!user);
            });
        } catch (error) {
            console.error("User Required Error:", error);
            resolve(false); 
        }
    });
}



/// Post functions
//  /////////////////////////////*FrontendNOT*///////////////////////////////////
//  json style(body)
chat.post("/sendmessage", async (req, res) => {
    // Body{obj.receiverId, obj.content}
    let chatkey = null;
    // console.log("----------------------------------------------");
    try {
        const obj = req.body;
        const currentUser = await User.findById(req.user.id).populate({
            path: 'chatList',
            match: {
                usertwo: obj.receiverId,

            }
        });

        // console.log("\n");
        // console.log(obj.receiverId);
        const receiverUser = await User.findById(obj.receiverId).populate({
            path: 'chatList',
            match: {
                usertwo: req.user.id,
            }
        });

        // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

        if (!currentUser) {
            // console.log("Current User empty");
            res.status(404).json({ error: 'currentUser not found' });
        } else if (!receiverUser) {
            // console.log("Receiver User empty");
            res.status(404).json({ error: 'currentUser not found' });
        }

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
        let cryptconent = await encryptMessage(obj.content,currentUser.chatList[0].chatKey);
        // console.log("crtype conetent------------")
        // console.log(cryptconent);
        // console.log('====================================');
        let decrtypy = await decryptMessage(cryptconent,currentUser.chatList[0].chatKey)
        // console.log("decrtypy conetent------------")
        // console.log(decrtypy)
        // console.log('====================================');
        const message = await Message.create({
            content: cryptconent,
            receiverId: obj.receiverId,
            senderId: req.user.id,
            chat: chatIdCurrentUser
        });

        const message2 = await Message.create({
            content: cryptconent,
            receiverId: obj.receiverId,
            senderId: req.user.id,
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

        return  res.status(200).send(true);
    } catch (error) {
        // console.log(error);
        return error;
    }
});
// Get Methods m///////////////*FrontendNOT*////////////////////////////////////////////
// /chatmessages?page=0&receiverId=123
chat.get('/chatmessages', async (req, res) => {
    try {

         const myid = req.user.id
        const { page, receiverId } = req.query;
        // console.log("\n ''''''''''''''''''''")

        const limit = 100
        const skipCount = page * limit;

        if (! await CheckUser(receiverId)) {
            // console.log("not found user");
            return res.status(404).json({ error: "not found" });
        }


        const chatQuery = {
            $and: [
                { usertwo: receiverId },
                { owner: req.user.id }
            ]
        };
        const mychat = await Chat.find(chatQuery).populate({
            path: 'messages',
            options: {
                limit: limit,
                skip: skipCount,
                sort: { dateTime: 1 }
            }
        });

        //console.log(mychat)
        const decryptedMessages = [];

        mychat.forEach(chat => {
            chat.messages.forEach(element => {
                // let decrtpycontent = decryptMessage(element.content,chat.chatKey);
                // element.content = decrtpycontent;
                decryptedMessages.push(element)
            });
        });



      

        return res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

