import jwt from "jsonwebtoken";
import User from "../models/User.mjs";

export async function verifyToken(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) return res.status(400).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(400).json({ error: "False token" });

    const user = await User.findById(decoded._id, {
      _id: 1,
      imageUrl: 1,
      username: 1,
      email: 1,
    });
    if (!user) {
      return res.status(400).json({ error: "User not in database" });
    }

    next();
  } catch (error) {
    return res.status(400).json({ error: "Unauthorized" });
  }
}

export async function addUserId(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(400).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(400).json({ error: "False token" });

    const user = await User.findById(decoded._id, {
      _id: 1,
      imageUrl: 1,
      username: 1,
      email: 1,
    });
    if (!user) {
      return res.status(400).json({ error: "User not in database" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Unauthorized" });
  }
}
