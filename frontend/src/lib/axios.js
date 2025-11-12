import axios from "axios";

let API_URL = "";

// 🌍 Dynamically detect backend URL
if (typeof window !== "undefined") {
  const { hostname, protocol } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // 💻 Local development
    API_URL = "http://localhost:5001/api";
  } else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    // 📱 LAN (hotspot / phone)
    API_URL = `http://${hostname}:5001/api`;
  } else if (hostname.includes("cloudworkstations.dev")) {
    // ☁️ Cloud Workstations (replace 5173- prefix with 5001-)
    API_URL = `https://${hostname.replace(/^5173-/, "5001-")}/api`;
  } else {
    // 🌐 Production (Vercel, Render, etc.)
    API_URL = `${protocol}//${hostname}/api`;
  }
}

console.log("🔗 Using API_URL:", API_URL);

// ⚙️ Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // include cookies automatically
});

// 🔐 Attach JWT token (if exists)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧠 Centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
