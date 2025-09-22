import { Router } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User.mjs";

const router = Router();

// Sign up for pending
router.post(
  "/api/auth/signup",
  body("username").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty())
      return res.status(400).json({ error: "Validation error" });

    const { username, email, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarColors = [
      "red",
      "blue",
      "green",
      "purple",
      "pink",
      "indigo",
      "orange",
      "teal",
      "cyan",
    ];

    const pickColor =
      avatarColors[Math.floor(Math.random() * avatarColors.length)];

    try {
      const newUser = await User.create({
        avatarBg: pickColor,
        username,
        email,
        password: hashedPassword,
      });

      const responseUser = {
        _id: newUser._id,
        avatarBg: newUser.avatarBg,
        username: newUser.username,
        email: newUser.email,
        imageUrl: newUser.imageUrl,
      };

      const jwtToken = jwt.sign(
        { _id: responseUser._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      // Server domain: Client side auto authing info
      res.cookie("auth_token", jwtToken, {
        httpOnly: true,
        sameSite: process.env.STAGE === "production" ? "none" : "lax",
        secure: process.env.STAGE === "production",
        maxAge: 1000 * 3600 * 24,
      });

      return res.status(200).json(responseUser);
    } catch (error) {
      return res.status(500).json({ error: "Signup Failed" });
    }
  }
);

// verify otp
router.post(
  "/api/auth/otp-verify",
  body("username").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {}
);

// Login with credentials
router.post("/api/auth/login", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const { username, password } = req.body;

  const user = await User.findOne({ $or: [{ email: username }, { username }] });
  if (!user) return res.status(404).json({ error: "No such user found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Wrong password" });

  // if (password !== user.password)
  //   return res.status(400).json({ error: "Wrong password" });

  const responseUser = {
    avatarBg: user.avatarBg,
    _id: user._id,
    username: user.username,
    email: user.email,
    imageUrl: user.imageUrl,
  };

  try {
    const jwtToken = jwt.sign(
      { _id: responseUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Server domain: Client side auto authing info
    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      sameSite: process.env.STAGE === "production" ? "none" : "lax",
      secure: process.env.STAGE === "production",
      maxAge: 1000 * 3600 * 24,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Could not set cookie" });
  }

  return res.status(200).json(responseUser);
});

// Verify through token on request
router.get("/api/auth/token", async (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(400).json({ error: "No token" });

  try {
    const jwtUser = jwt.verify(token, process.env.JWT_SECRET);
    if (!jwtUser) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(jwtUser._id, {
      _id: 1,
      imageUrl: 1,
      username: 1,
      email: 1,
      avatarBg: 1,
    });
    if (!user) {
      return res.status(401).json({ error: "User not in database" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "JWT malformed" });
  }
});

// Logout on req
router.get("/api/auth/logout", async (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(400).json({ error: "No token" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Server domain: Client side auto authing info
    res.cookie("auth_token", null, {
      httpOnly: true,
      sameSite: process.env.STAGE === "production" ? "none" : "lax",
      secure: process.env.STAGE === "production",
      maxAge: 0,
    });

    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "JWT malformed" });
  }
});

export default router;
