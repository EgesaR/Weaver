import cors from "cors";

// --- Allowed origins ---
export const allowedOrigins = [
  // Cloud Workstation regex
  /^https:\/\/\d+-firebase-weavergit-\d+\.cluster-[a-z0-9]+\.cloudworkstations\.dev$/,
  // Local dev (Vite)
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // LAN IP range (adjust if needed)
  /^http:\/\/192\.168\.43\.\d{1,3}(:\d+)?$/,
  // Backend served frontend (production)
  "http://0.0.0.0:5001",
  "http://localhost:5001",
  "http://127.0.0.1:5001",
];

export const cors_setup = cors( {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin: o.test(origin)
    );

    if (allowed) return callback(null, true);

    // Debug logging for blocked origins
    console.log("❌ Blocked by CORS:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  // allow cookies/auth headers
  methods: ["GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"],
  allowedHeaders: ["Content-Type",
    "Authorization"],
});