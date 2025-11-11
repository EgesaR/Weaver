import axios from "axios";

let API_URL = "";

// 🌍 Detect environment and pick correct backend
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    // Local dev
    API_URL = "http://localhost:5001/api";
  } else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    // LAN (hotspot / phone)
    API_URL = `http://${hostname}:5001/api`;
  } else if (hostname.includes("cloudworkstations.dev")) {
    // Cloud Workstations (Vite frontend runs on 5173)
    // Replace port 5173 with 5001 for backend service
    API_URL = `https://${hostname.replace("5173", "5001")}/api`;
  } else {
    // Production (Vercel, Render, etc.)
    API_URL = `https://${hostname}/api`;
  }
}

console.log("🔗 Using API_URL:", API_URL);

// ⚙️ Create instance with correct baseURL
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies/session automatically
});

// 🔐 Attach JWT token (if using localStorage-based auth)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧠 Optional: centralized error logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
