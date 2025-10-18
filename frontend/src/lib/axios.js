import axios from "axios";

let API_URL;

if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  API_URL = "http://localhost:5001/api";
} else if (typeof process !== "undefined" && process.env.WEB_HOST) {
  // Cloud Workstations: Use port prefix + $WEB_HOST (e.g., https://5001-5173-firebase-weavergit-...cloudworkstations.dev)
  const portPrefix = "5001"; // Your backend port
  const webHost = process.env.WEB_HOST || '';
  // Strip leading port from $WEB_HOST if present (e.g., remove '-5173-' or '5173-' to avoid duplication)
  const cleanHost = webHost.replace(/^-?\d+-/, '');
  API_URL = `https://${portPrefix}-${cleanHost}/api`;
} else {
  // Fallback for LAN/production (keep HTTP for now, but consider HTTPS in prod)
  API_URL = `http://${window.location.hostname}:5001/api`;
}

// Optional: Log for debugging (remove in production)
console.log("API_URL:", API_URL);

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});