import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {
  app,
  server
} from "./lib/socket.js";
import {
  getLocalIP
} from "./lib/utils.js";
import {
  cors_setup
} from "./configs/configs.js";

import path from "path"

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve()

// --- CORS ---
app.use(cors_setup);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static("public/uploads"));

// --- 404 CATCH-ALL ---
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html")))
}

// --- START SERVER ---
server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log(`✅ Backend running locally: http://${ip}:${PORT}`);
  console.log(
    `🌐 Cloud Workstations: https://5001-firebase-weavergit-1757596573889.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev`
  );
});