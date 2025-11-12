import os from "os";
import config from "../config/config.js";

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

/**
 * Returns the base URL for the backend (used for images & sockets)
 *
 * Priority:
 * 1. process.env.BACKEND_ORIGIN (explicit override)
 * 2. production -> https://{config.backendHost}
 * 3. development -> http://{local-ip}:{config.port}
 */
export function getBaseUrl() {
  if (process.env.BACKEND_ORIGIN) {
    return process.env.BACKEND_ORIGIN;
  }

  if (config.nodeEnv === "production") {
    return `https://${config.backendHost}`;
  }

  const ip = getLocalIP();
  return `http://${ip}:${config.port}`;
}
