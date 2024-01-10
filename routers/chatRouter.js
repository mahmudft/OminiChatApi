import express from "express";
import { User } from "../entities/user.entity.js";
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";

export const chat = express.Router();

////// FUNCTION

async function CheckUser(userid) {
    return new Promise(async (resolve) => {
        try {
            setTimeout(async () => {
                const user = await User.findById(userid);
              

                resolve(!!user); // Kullanıcı varsa true, yoksa false döndürür
            });
        } catch (error) {
            console.error("Kullanıcı sorgulanırken hata:", error);
            resolve(false); // Hata durumunda false döndürür
        }
    });
}


////////////////////// DUZEDIM
/// Post functions
//  /////////////////////////////*FrontendNOT*///////////////////////////////////
//  json style(body)
chat.post("/sendmessage", async (req, res) => {
    // Body{obj.receiverId, obj.content}
    console.log("----------------------------------------------");
    try {
        const obj = req.body;
        const currentUser = await User.findById(req.user.id).populate({
            path: 'chatList',
            match: {
                usertwo: obj.receiverId,

            }
        });

        console.log("\n");
        console.log(obj.receiverId);
        const receiverUser = await User.findById(obj.receiverId).populate({
            path: 'chatList',
            match: {
                usertwo: req.user.id,
            }
        });

        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

        if (!currentUser) {
            console.log("Current User empty");
            res.status(404).json({ error: 'currentUser not found' });
        } else if (!receiverUser) {
            console.log("Receiver User empty");
            res.status(404).json({ error: 'currentUser not found' });
        }

        console.log("current user chat list \n");
        console.log(currentUser.chatList.length);

        // xetta bunun cagridgi ifinin icersinde idi hele eldim
        const createAndSaveChat = async (user, receiverId) => {
            const chatldata = await Chat.create({
                usertwo: receiverId,
                owner: user.id,
                messages: []
            });

            user.chatList.push(chatldata._id);

            await user.save();
            return chatldata;
        };

        if (!currentUser.chatList || currentUser.chatList.length === 0) {

            const chatListData = await createAndSaveChat(currentUser, obj.receiverId);
            currentUser.chatList = [chatListData]; /// xetabunda imis yazdim duzeldi bele tezden beraber edende
        }

        console.log(receiverUser.chatList.length);
        console.log("\nifffffffffffff\n");

        if (!receiverUser.chatList || receiverUser.chatList.length === 0) {
            const chatListData = await createAndSaveChat(receiverUser, req.user.id);
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

        return  res.status(200).send(true);
    } catch (error) {
        console.log(error);
        return error;
    }
});


// Get Methods
///////////////*FrontendNOT*////////////////////////////////////////////
// /chatmessages?page=0&receiverId=123
chat.get('/chatmessages', async (req, res) => {
    try {
        const { page, receiverId } = req.query;
        console.log("''''''''''''''''''''")

        const limit = 2
        const skipCount = page * limit;

        if (! await CheckUser(receiverId)) {
            console.log("not found user");
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
                sort: { dateTime: -1 }
            }
        });

        const messagesArray = mychat.flatMap(chat => chat.messages); // create 1 array

        return res.status(200).json(messagesArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

