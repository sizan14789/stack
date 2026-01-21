import "dotenv/config";
import express from "express";
import connectDB from "./utils/connectDB.mjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";

// Routers
import authRouter from "./routes/auth.mjs";
import chatsRouter from "./routes/chatsRouter.mjs";
import messagesRouter from "./routes/messagesRouter.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

// Enabling cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Parsing data
app.use(express.json());
app.use(cookieParser());

// Connecting Database
connectDB()
  .then(() => {
    console.log("Database integrated");
  })
  .catch((e) => {
    console.log(e);
  });

// Routes
app.use(authRouter);
app.use(chatsRouter);
app.use(messagesRouter);
app.use(userRoutes);

// pings
app.get("/health", (_req, res) => {
  return res.sendStatus(200);
});

// socket integration
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

export const socketMap = new Map();

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    socketMap.set(userId, socket.id);
  });
});

// Starting server
server.listen(process.env.PORT, () => {
  console.log("Server on");
});
