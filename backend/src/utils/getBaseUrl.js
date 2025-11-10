import os from "os";
import config from "../config/config.js";

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address; // e.g. 192.168.0.105
      }
    }
  }
  return "localhost";
}

/**
 * Returns the full base URL depending on environment.
 * Works for:
 * - local dev (localhost or phone IP)
 * - production (Render, Vercel, etc.)
 * - Replit, Gitpod, etc.
 */
export function getBaseUrl() {
  if (config.nodeEnv === "production") {
    // In production, trust the public frontend origin
    return config.frontendOrigins[0] || "";
  } else {
    const ip = getLocalIP();
    return `http://${ip}:${config.port}`;
  }
}
