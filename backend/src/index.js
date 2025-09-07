import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {
  networkInterfaces
} from "os";
import cookieParser from "cookie-parser"

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;

// Get local IP address dynamically
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

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  /^http:\/\/192\.168\.43\.\d{1,3}:5173$/, // Matches 192.168.43.*:5173
];
app.use(
  cors( {
    origin: (origin, callback) => {
      console.log("Request Origin:", origin); // Debug

      if (!origin) return callback(null, true); // Allow mobile apps / curl

      const allowedOrigins = [
        "http://localhost:5173",
        /^http:\/\/192\.168\.43\.\d{1,3}:5173$/,
        // local network Vite
      ];

      const isAllowed = allowedOrigins.some((allowedOrigin) =>
        typeof allowedOrigin === "string"
        ? allowedOrigin === origin: allowedOrigin.test(origin)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("❌ Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"],
    // ✅ allow PUT & DELETE
    allowedHeaders: ["Content-Type",
      "Authorization"],
    // ✅ more flexible
  })
);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); // For form data
app.use(cookieParser())

// Auth routes
app.use("/api/auth", authRoutes);

// Message routes
app.use("/api/message", messageRoutes);

app.use("/uploads", express.static("public/uploads"));

app.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log(`Backend is running on http://${ip}:${PORT}`);
});