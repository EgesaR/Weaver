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
const userSocketMap = new Map();
export const getReceiverSocketId = (userId) =>
  userSocketMap.get(String(userId))?.values().next().value;
export const getReceiverSocketIds = (userId) =>
  [...(userSocketMap.get(String(userId)) || [])];

const getOnlineUserIds = () =>
  [...userSocketMap.keys()].map((userId) => Number(userId));

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
    const userKey = String(userId);
    const sockets = userSocketMap.get(userKey) || new Set();
    sockets.add(socket.id);
    userSocketMap.set(userKey, sockets);
    socket.join(`user:${userKey}`);
    console.log(`User ${userId} added with socket ID ${socket.id}`);
  }

  io.emit("getOnlineUsers", getOnlineUserIds());

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (userId) {
      const userKey = String(userId);
      const sockets = userSocketMap.get(userKey);
      sockets?.delete(socket.id);
      if (sockets?.size === 0) userSocketMap.delete(userKey);
    }
    io.emit("getOnlineUsers", getOnlineUserIds());
  });
});

export { app, server, io };
