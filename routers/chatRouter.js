import express from "express"
import { User } from "../entities/user.entity.js"
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";
export const chat = express.Router()

// mytoken eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWQ0YWQ1YjFiMzExZjllMWE4OGM5YyIsImVtYWlsIjoibmloYXRheHVuZHphZGUwNkBnbWFpbC5jb20iLCJpYXQiOjE3MDQ4MDcxMzgsImV4cCI6MTcwNDk3OTkzOH0.-HfU0VBg_2Qb_CExh6YFhGppuns5tnnGWQxSGQbYKbNtjDsdzWf1DyemJpNXA9Hc30j61SpDxGZQXsPJ4CfxTg

chat.post("/sendmessage", async (req, res) => {
    // Body{obj.receiverId,obj.content}
    console.log("----------------------------------------------")
    try {
        let obj = req.body;
        const currentUser = await User.findById(req.user.id).populate({
            path: 'chatList',
            match: {
                receiverId: obj.receiverId,
                senderId: req.user.id
            }
        });

        console.log("\n")
        console.log(obj.receiverId)
        const receiverUser = await User.findById(obj.receiverId).populate({
            path: 'chatList',
            match: {
                receiverId: obj.receiverId,
                senderId: req.user.id
            }
        });
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

        if (!currentUser) {
            console.log("Current User empty")
            return;
        }
        else if (!receiverUser) {
            console.log("ReceiverUser User empty")
            return;
        }

        console.log("currrent user chat list \n")
        console.log(currentUser.chatList.length)

        if (!currentUser.chatList || currentUser.chatList.length == 0) {
            const chatldata = new Chat({
                receiverId: obj.receiverId,
                senderId: currentUser._id,
                owner: currentUser._id
            });
            chatldata.messages = [];
            currentUser.chatList.push(chatldata._id);
            await chatldata.save();
            await currentUser.save();

        }

        console.log(receiverUser.chatList.length)
        console.log("\nifffffffffffff\n")

        if (!receiverUser.chatList || receiverUser.chatList.length == 0) {
            const chatldata = new Chat({
                receiverId: obj.receiverId,
                senderId: currentUser._id,
                owner: receiverUser._id
            });
            chatldata.messages = [];
            receiverUser.chatList.push(chatldata._id);
            await chatldata.save();
            await receiverUser.save();

        }
        console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzSECTION 2zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
        console.log(currentUser.chatList[0]);
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
        console.log("\n ")
        console.log(receiverUser.chatList[0]);

        currentUser.chatList[0].messages.push(message._id);
        //receiverUser.chatList[0].messages.push(message2._id);
        await message.save();
        await message2.save();
        await currentUser.chatList[0].save();
       // await receiverUser.chatList[0].save();
        await currentUser.save();
        await receiverUser.save();


        console.log("--------- send message section ------");
        // console.log(obj);
        // console.log(currentUser)
        // console.log(receiverUser);
        return"ture"
    } catch (error) {
        console.log(error)
        return error
    }


})