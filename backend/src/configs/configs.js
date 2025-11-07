import cors from "cors";

// --- Allowed origins ---
export const allowedOrigins = [
  /^https:\/\/\d+-firebase-weavergit-\d+\.cluster-[a-z0-9]+\.cloudworkstations\.dev$/,
  "http://localhost:5173",
  /^http:\/\/192\.168\.43\.\d{1,3}(:\d+)?$/,
];

export const cors_setup = cors( {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin: o.test(origin)
    );
    if (allowed) return callback(null, true);
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
})