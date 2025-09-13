import { Router } from "express";
import { addUserId, verifyToken } from "../middlewares/verifyUser.mjs";
import Chat from "../models/Chat.mjs";

const router = Router();

// get chats by user
router.get("/api/chats", addUserId, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .sort({ updatedAt: -1 })
      .populate("participants", "_id avatarBg username imageUrl");
    res.status(200).json(chats);
  } catch (error) {
    return res.status(400).json({ error: "Internal error" });
  }
});

// Create chats
router.post("/api/chats", addUserId, async (req, res) => {
  try {
    const participants = [req.body?.partner, req.userId];
    const chatExists = await Chat.findOne({ participants: { $all: participants } });
    if(chatExists){
      return res.status(205).json(chatExists)
    }
    const createdChat = await Chat.create({ participants });
    const chat = await Chat.findById(createdChat._id).populate(
      "participants",
      "_id username avatarBg imageUrl"
    );
    res.status(201).json(chat);
  } catch (error) {
    return res.status(400).json({ error: "Internal error" });
  }
});

// get specific chat info
router.get("/api/chats/:chatId", verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "participants",
      "_id avatarBg username imageUrl"
    );

    if (!chat) return res.status(400).json({ error: "Invalid chatId" });
    res.status(200).json(chat);
  } catch (error) {
    return res.status(400).json({ error: "Invalid chatId" });
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
    res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(400).json({ error: "Sync Failed" });
  }
});

export default router;
