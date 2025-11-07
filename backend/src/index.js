import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
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

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

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

// --- Serve Frontend ---
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}



// --- START SERVER ---
server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log(`✅ Backend running locally: http://${ip}:${PORT}`);
});