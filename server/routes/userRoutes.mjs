import { Router } from "express";
import { addUserId } from "../middlewares/verifyUser.mjs";
import User from "../models/User.mjs";
import mongoose from "mongoose";
import Chat from "../models/Chat.mjs";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/api/users/:search", addUserId, async (req, res) => {
  try {
    const users = await User.find(
      {
        username: { $regex: req.params?.search, $options: "i" },
        _id: { $ne: new mongoose.Types.ObjectId(req.userId) },
      },
      { _id: 1, username: 1, avatarBg: 1, imageUrl: 1 }
    );
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/api/users", addUserId, async (req, res) => {
  try {
    // const chats = await Chat.find({ participants: req.userId });
    await Chat.deleteMany({ participants: req.userId });

    await User.findByIdAndDelete(req.userId);

    res.cookie("auth_token", null, {
      httpOnly: true,
      sameSite: process.env.STAGE === "production" ? "none" : "lax",
      secure: process.env.STAGE === "production",
      maxAge: 0,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Delete failed" });
  }
});

router.put("/api/users", addUserId, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { imageUrl: req.body.imageUrl },
      { new: true }
    );
    let payload = await User.findById(req.userId, {
      username: 1,
      email: 1,
      avatarBg: 1,
      imageUrl: 1,
    });

    payload = {
      ...payload._doc,
      _id: req.userId
    }

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Server domain: Client side auto authing info
    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      sameSite: process.env.STAGE === "production" ? "none" : "lax",
      secure: process.env.STAGE === "production",
      maxAge: 1000 * 3600 * 24,
    });

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to set image" });
  }
});

export default router;


