// config.js
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Allowed origins
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  /^http:\/\/192\.168\.43\.\d{1,3}(:\d+)?$/, // hotspot IPs
  /^http:\/\/10\.22\.\d{1,3}\.\d{1,3}(:\d+)?$/, // local wifi IPs
  /^https:\/\/\d+-firebase-weavergit-\d+\.cluster-[a-z0-9]+\.cloudworkstations\.dev$/,
  "http://0.0.0.0:5001",
  "http://localhost:5001",
  "http://127.0.0.1:5001",
  "http://192.168.43.58:5173", // Added for explicit testing
];

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  frontendOrigins: ALLOWED_ORIGINS,
  corsOptions: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile apps / same origin

      const allowed = ALLOWED_ORIGINS.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(origin): pattern === origin
      );

      if (allowed) {
        console.log("✅ Allowed origin:", origin);
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"],
    allowedHeaders: ["Content-Type",
      "Authorization"],
  },
};

export default config