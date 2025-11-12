import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Allowed origins
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://5173-firebase-weavergit-1762766269357.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev",
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^http:\/\/10\.22\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https:\/\/\d+-firebase-weavergit-\d+\.cluster-[a-z0-9]+\.cloudworkstations\.dev$/,
];

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "dev_fallback_secret_key",

  // Backend host for production (used for images & sockets)
  backendHost:
    process.env.BACKEND_HOST ||
    "5001-firebase-weavergit-1762766269357.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev",

  frontendOrigins: ALLOWED_ORIGINS,

  corsOptions: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = ALLOWED_ORIGINS.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
      );

      if (allowed) return callback(null, true);

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
};

export default config;
