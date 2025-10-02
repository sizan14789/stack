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
      // prepping recent message
      const recentMessages = await Message.find(
        { chat: req.body.chat },
        { sender: 1, text: 1 }
      )
        .sort({ createdAt: -1 })
        .limit(100);
      recentMessages.reverse();

      const arrayForAi = recentMessages.map((cur) => {
        return {
          role: cur.sender.toString() === process.env.AI_ID ? "model" : "user",
          parts: [{ text: cur.text }],
        };
      });

      arrayForAi.push({
        role: "user",
        parts: [{ text: req.body?.text }],
      });

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash-lite",
        config: {
          systemInstruction:
            "You are an AI assistant called Neko. You are not allowed to use markdown of any kind",
        },
        contents: arrayForAi,
      });

      return { response, code: 200 };
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const sendToUSer = async () => {
    // prepping the message
    const senderId = req.userId;
    const messageData = { ...req.body, sender: senderId };

    // finding receiver
    const chat = await Chat.findById(req.body.chat);
    const receiver = chat.participants.find(
      (id) => senderId.toString() !== id.toString()
    );
    const receiverId = receiver.toString();

    // redirecting to ai section if sent to AI
    if (receiverId === process.env.AI_ID) {
      const rs = await sendToAi();
      if (rs.code === 200) {
        // saving sender's text and database
        const createdMessage = await Message.create(messageData);
        await Chat.findByIdAndUpdate(
          req.body?.chat,
          { lastText: req.body.text },
          { new: true }
        );

        // database saving
        const aiResponse = await Message.create({
          chat: req.body?.chat,
          sender: process.env.AI_ID,
          text: rs.response.text,
        });

        await Chat.findByIdAndUpdate(
          req.body?.chat,
          { lastText: rs.response.text },
          { new: true }
        );

        const aiSocketResponse = await Message.findById(
          aiResponse._id
        ).populate("sender", "_id avatarBg username imageUrl");

        // socket part
        const userId = req.userId.toString();
        if (socketMap.has(userId)) {
          io.to(socketMap.get(userId)).emit("text received", aiSocketResponse);
        } else {
          // console.log(userId);
        }

        return res.status(201).json(createdMessage);
      } else {
        return res.status(301).json({ error: "Quota exceeded" });
      }
    }

    // synching database and last text
    const createdMessage = await Message.create(messageData);
    await Chat.findByIdAndUpdate(
      req.body?.chat,
      { lastText: req.body.text },
      { new: true }
    );

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
    // sendToAi();
  } catch (error) {
    return res.status(500).json({ error: "Messages fetching failed" });
  }
});

// router for read messages
router.put("/api/messages/read", addUserId, async (req, res) => {
  try {
    const updatedMessages = await Message.updateMany(
      {
        chat: req.body.chat,
        createdAt: { $lte: req.body.createdAt },
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    const chat = await Chat.findById(req.body.chat).populate("participants", "_id");
    
    const participants = chat.participants;
    const receiver = req.userId.toString();

    const readRecipient = participants.find(
      (each) => receiver.toString() !== each._id
    );

    const readRecipientId = readRecipient._id.toString();

    if (socketMap.has(readRecipientId)) {
      io.to(socketMap.get(readRecipientId)).emit("read", {});
    }

    return res.sendStatus(205);
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
