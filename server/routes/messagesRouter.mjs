import { Router } from "express";
import { addUserId, verifyToken } from "../middlewares/verifyUser.mjs";
import Message from "../models/Message.mjs";
import { io, socketMap } from "../index.mjs";
import Chat from "../models/Chat.mjs";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

router.get("/api/messages/:chatId", verifyToken, async (req, res) => {
  const chatId = req.params?.chatId;
  try {
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .populate("sender", "_id avatarBg username imageUrl");
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: "Messages fetching failed" });
  }
});

router.post("/api/messages", addUserId, async (req, res) => {
  const sendToAi = async () => {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${req.body?.text} ---- Note:don't stylize text, break lines or highlight anything at all...keep everything simple text, avoid line breaking in clever way...Imagine yourself as a chat bot.. don't mention anything about the note part in ur response`,
      });

      const aiResponse = await Message.create({
        chat: req.body?.chat,
        sender: process.env.AI_ID,
        text: response.text,
      });

      const aiSocketResponse = await Message.findById(
        aiResponse._id
      ).populate("sender", "_id avatarBg username imageUrl");

      // socket part
      const userId = req.userId.toString();
      if (socketMap.has(userId)) {
        io.to(socketMap.get(userId)).emit("text received", aiSocketResponse);
      } else {
        console.log(userId);
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const sendToUSer = async () => {
    // prepping the message
    const senderId = req.userId;
    const messageData = { ...req.body, sender: senderId };

    const createdMessage = await Message.create(messageData); // synching database

    // finding receiver
    const chat = await Chat.findById(createdMessage.chat);
    const receiver = chat.participants.find(
      (id) => senderId.toString() !== id.toString()
    );
    const receiverId = receiver.toString();

    if (receiverId === process.env.AI_ID) {
      if (sendToAi()) {
        return res.status(201).json(createdMessage);
      } else {
        return res.status(500).json({ error: "Messages fetching failed" });
      }
    }

    // Prepping and sending socket response
    const emittingMessage = await Message.findById(createdMessage._id).populate(
      "sender",
      "_id avatarBg username imageUrl"
    );
    if (socketMap.has(receiverId)) {
      io.to(socketMap.get(receiverId)).emit("text received", emittingMessage);
    }

    // http response
    return res.status(201).json(createdMessage);
  };

  try {
    await sendToUSer();
  } catch (error) {
    return res.status(500).json({ error: "Messages fetching failed" });
  }
});

export default router;
