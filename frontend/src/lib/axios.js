import axios from "axios";

let API_URL = "";

// Cloud Workstations / LAN / Localhost logic
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    API_URL = "http://localhost:5001/api";
  } else if (/^192\.168\.43\.\d{1,3}$/.test(hostname)) {
    // LAN phone access
    API_URL = `http://${hostname}:5001/api`;
  } else if (hostname.includes("cluster-") && hostname.includes("cloudworkstations.dev")) {
    // Cloud Workstations
    API_URL = `https://${hostname}/api`;
  } else {
    // Fallback
    API_URL = `http://${hostname}:5001/api`;
  }
}

console.log("Using API_URL:", API_URL);

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? API_URL: "/api",
  withCredentials: true, // Needed for cookies/auth
});

// Optional: attach token automatically if using JWT
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});