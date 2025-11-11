// socket.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const app = express();
const server = http.createServer(app);

// --- CORS Middleware ---
app.use(cors(config.corsOptions));
app.options(/^\/.*$/, cors(config.corsOptions)); // handle preflight

// --- User Socket Map ---
const userSocketMap = {};
export const getReceiverSocketId = (userId) => userSocketMap[userId];

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: config.corsOptions,
  transports: ["websocket", "polling"], // Prefer WebSocket
});

// --- Authentication Middleware for Socket.IO ---
io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("jwt="))
    ?.split("=")[1];

  if (!token) return next(new Error("Unauthorized"));

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// --- Socket Events ---
io.on("connection", (socket) => {
  console.log(
    "✅ User connected:",
    socket.id,
    "from origin:",
    socket.handshake.headers.origin
  );

  const userId = socket.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} added with socket ID ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap).map(Number));

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap).map(Number));
  });
});

export { app, server, io };
