import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { networkInterfaces } from "os";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Get local IP address dynamically (optional, for local logging)
function getLocalIP() {
  const interfaces = networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === "IPv4" && !details.internal && details.address.startsWith("192.168.43.")) {
        return details.address;
      }
    }
  }
  return "0.0.0.0"; // Fallback
}

// CORS configuration - Dynamic regex for Cloud Workstations
const allowedOrigins = [
  /^https:\/\/5173-firebase-weavergit-\d+\.cluster-[a-z0-9]+\.cloudworkstations\.dev$/,
  "http://localhost:5173",
  /^https?:\/\/192\.168\.43\.\d{1,3}:5173$/, // Local network (HTTP/HTTPS)
];

// Custom CORS middleware to access req
app.use((req, res, next) => {
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin, "Method:", req.method, "Path:", req.path);
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowedOrigin) =>
        typeof allowedOrigin === "string"
          ? allowedOrigin === origin
          : allowedOrigin.test(origin)
      );
      if (isAllowed) {
        console.log("✅ Allowed Origin:", origin);
        callback(null, true);
      } else {
        console.log("❌ Blocked Origin:", origin, "Path:", req.path);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })(req, res, next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());

// Auth routes
app.use("/api/auth", authRoutes);

// Message routes
app.use("/api/messages", messageRoutes);

app.use("/uploads", express.static("public/uploads"));

// Optional: Catch-all for debugging 404s
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Route not found" });
});

// In index.js, before the 404 catch-all
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Weaver API" });
});

app.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log(`Backend is running on http://${ip}:${PORT}`);
  console.log(`External access (Cloud Workstations): https://5001firebase-weavergit-1757596573889.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev`);
});