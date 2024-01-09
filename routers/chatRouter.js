import express from "express"
import { User } from "../entities/user.entity.js"
import { Message } from "../entities/message.entity.js";
import { Chat } from "../entities/chat.entity.js";
export const chat = express.Router()

// mytoken eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWM4NGE0YmE1OTcyMTViNjNjYmQyZCIsImVtYWlsIjoibmloYXRheHVuZHphZGUwNjJAZ21haWwuY29tIiwiaWF0IjoxNzA0NzU2NDQyLCJleHAiOjE3MDQ5MjkyNDJ9.H9nqOaI59SjSDjMzrbcxpOIx68Ki8M3nsdv5ube1vRvFHpl6phN7pgcARGyTWoZufjWUZE2Z5OEU4cBA7EdkBQ
// receivertoken eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWM4NjBiMGM3MDlhYmMwOTIzYWIyNSIsImVtYWlsIjoibmloYXRheHVuZHphZGUwNkBnbWFpbC5jb20iLCJpYXQiOjE3MDQ3NTY3NTYsImV4cCI6MTcwNDkyOTU1Nn0.OVeAiJ_vOoeqvPPStyLemW74Te-7zBcNB9lgu-Mvup06Ot7TprHVqj5Ro4rlp8u49Qzl3fhd_oCKfWEnlpYnCA

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
                receiverId: currentUser.id,
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

        if (!currentUser.chatList || currentUser.chatList.length == 0) {
            const chatldata = new Chat({
                receiverId: obj.receiverId,
                senderId: currentUser._id,
                owner: currentUser._id
            });

            currentUser.chatList.push(chatldata._id);
            await chatldata.save();
            await currentUser.save();


        }


        if (!receiverUser.chatList || receiverUser.chatList.length == 0) {
            const chatldata = new Chat({
                receiverId: obj.receiverId,
                senderId: currentUser._id,
                owner: receiverUser._id
            });
            receiverUser.chatList.push(chatldata._id);
            await chatldata.save();
            await receiverUser.save();

        }
        console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
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



        currentUser.chatList[0].messages.push(message);
        receiverUser.chatList[0].messages.push(message2);
        await message.save();
        await message2.save();
        await currentUser.save();
        await receiverUser.save();


        console.log("--------- send message section ------");
        console.log(obj);
        console.log(currentUser)
        console.log(receiverUser);
    } catch (error) {
        console.log(error)
        return error
    }


})