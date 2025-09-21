import { Router } from "express";
import { addUserId, verifyToken } from "../middlewares/verifyUser.mjs";
import Message from "../models/Message.mjs";
import { io, socketMap } from "../index.mjs";
import Chat from "../models/Chat.mjs";

const router = Router();

router.get("/api/messages/:chatId", verifyToken, async (req, res) => {
  const chatId = req.params?.chatId;
  try {
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .populate("sender", "_id avatarBg username imageUrl");
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(400).json({ error: "Messages fetching failed" });
  }
});

router.post("/api/messages", addUserId, async (req, res) => {
  try {
    // prepping the message
    const senderId = req.userId;
    const messageData = {...req.body, sender:senderId}
    
    const createdMessage = await Message.create(messageData); // synching database

    // sending socket event
    const emittingMessage = await Message.findById(createdMessage._id).populate(
      "sender",
      "_id avatarBg username imageUrl"
    );
    
    console.log(socketMap)

    // socket response
    const chat = await Chat.findById(emittingMessage.chat);

    const receiver = chat.participants.find(
      (id) => senderId.toString() !== id.toString()
    );
    const receiverId = receiver.toString();
    
    if (socketMap.has(receiverId)) {
      io.to(socketMap.get(receiverId)).emit("text received", emittingMessage);
    }

    // http response
    return res.status(201).json(createdMessage);
  } catch (error) {
    return res.status(400).json({ error: "Messages fetching failed" });
  }
});

export default router;
