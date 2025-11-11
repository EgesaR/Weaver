// index.js
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import {
  fileURLToPath
} from "url";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {
  app,
  server
} from "./lib/socket.js";
import { getBaseUrl } from "./utils/getBaseUrl.js";
import config from "./config/config.js";
//import config from "./config/config.js";

// --- Resolve __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// --- Serve uploads ---
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- Serve frontend (React SPA) in production ---
if (config.nodeEnv === "production") {
  const distPath = path.join(__dirname, "../../frontend/dist");

  // Serve static assets first
  app.use(express.static(distPath));

  // Catch-all route for SPA
  app.get(/^\/.*$/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// --- START SERVER ---
server.listen(config.port, "0.0.0.0", () => {
  const ip = getBaseUrl();
  console.log(`✅ Backend running locally: http://${ip}:${config.port}`);
});