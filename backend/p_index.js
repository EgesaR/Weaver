import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import {
  fileURLToPath
} from "url";
import {
  networkInterfaces
} from "os";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

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
      console.log("Request Origin:", origin); // Log origin for debugging
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowedOrigin) =>
        typeof allowedOrigin === "string"
        ? allowedOrigin === origin: allowedOrigin.test(origin)
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET",
      "POST",
      "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Ensure data.json exists
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({
      text: ""
    },
      null,
      2));
  }
}
initializeDataFile();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running"
  });
});

// Save text
app.post("/api/save", async (req, res) => {
  console.log("Request Body:",
    req.body); // Log body for debugging
  try {
    const {
      text
    } = req.body;
    if (typeof text !== "string") {
      return res.status(400).json({
        error: "Text must be a string"
      });
    }
    await fs.writeFile(DATA_FILE, JSON.stringify({
      text
    }, null, 2));
    res.json({
      message: "Text saved successfully"
    });
  } catch (error) {
    console.error("Error saving text:", error);
    res.status(500).json({
      error: "Failed to save text"
    });
  }
});

// Fetch text
app.get("/api/fetch", async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const {
      text
    } = JSON.parse(data);
    res.json({
      text
    });
  } catch (error) {
    console.error("Error fetching text:", error);
    res.status(500).json({
      error: "Failed to fetch text"
    });
  }
});

app.listen(5002, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log(`Backend is running on http://${ip}:5002`);
});