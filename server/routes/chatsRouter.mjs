import { Router } from "express";
import { addUserId, verifyToken } from "../middlewares/verifyUser.mjs";
import Chat from "../models/Chat.mjs";
import Message from "../models/Message.mjs";
import { io, socketMap } from "../index.mjs";

const router = Router();

// get chats by user
router.get("/api/chats", addUserId, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .sort({ updatedAt: -1 })
      .populate("participants", "_id avatarBg username imageUrl");
    res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ error: "Internal error" });
  }
});

// Create chats
router.post("/api/chats", addUserId, async (req, res) => {
  try {
    const participants = [req.body?.partner, req.userId];
    const chatExists = await Chat.findOne({
      participants: { $all: participants },
    });
    if (chatExists) {
      return res.status(205).json(chatExists);
    }
    const createdChat = await Chat.create({ participants });
    const chat = await Chat.findById(createdChat._id).populate(
      "participants",
      "_id username avatarBg imageUrl"
    );
    res.status(201).json(chat);
  } catch (error) {
    return res.status(500).json({ error: "Internal error" });
  }
});

// get specific chat info
router.get("/api/chats/:chatId", verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "participants",
      "_id avatarBg username imageUrl"
    );

    if (!chat) return res.status(404).json({ error: "Invalid chatId" });
    res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ error: "Invalid chatId" });
  }
});

router.put("/api/chats/update/:chatId", verifyToken, async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      {
        lastText: req.body.text,
      },
      { new: true }
    );
    res.status(201).json(updatedChat);
  } catch (error) {
    return res.status(500).json({ error: "Sync Failed" });
  }
});

// read Purpose
router.put("/api/chats/read", addUserId, async (req, res) => {
  try {
    const latestMessage = await Message.findOne({ chat: req.body._id }).sort({
      createdAt: -1,
    });

    const updatedMessages = await Message.updateMany(
      {
        chat: req.body._id,
        createdAt: { $lte: latestMessage.createdAt },
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    if (!req.body.participants) return res.status(404).json({ error: "note found" });

    const receiverId = req.userId;
    const { participants } = req.body;
    
    const sender = participants.find((id) => receiverId.toString() !== id._id);

    if (socketMap.has(sender._id)) {
      io.to(socketMap.get(sender._id)).emit("read", latestMessage);
    }

    return res.sendStatus(205);
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
