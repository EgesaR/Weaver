import express from "express";
import http from "http";
import {
  Server
} from "socket.io";

const app = express();
const server = http.createServer(app);

// Map userId → socketId
const userSocketMap = {};

export const getReceiverSocketId = (userId) => userSocketMap[userId];

// --- SOCKET.IO CONFIG ---
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === "http://localhost:5173" ||
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^https:\/\/\d+-firebase-weavergit-\d+\.cluster-[a-z0-9]+\.cloudworkstations\.dev$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
  transports: ["polling",
    "websocket"],
  // ✅ fallback for handshake reliability
});

// --- SOCKET EVENTS ---
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} added with socket ID ${socket.id}`);
  }

  // Send updated list of online users (as numbers)
  io.emit("getOnlineUsers", Object.keys(userSocketMap).map(Number));

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap).map(Number));
  });
});

export {
  app, server, io
};