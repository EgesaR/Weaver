// Client-side useAuthStore.js (updated for better debugging and transport order)
import { create } from "zustand";
import { axiosInstance } from "/src/lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

let BASE_URL = "";
// Determine backend URL dynamically
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    BASE_URL = "http://localhost:5001";
  } else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    BASE_URL = `http://${hostname}:5001`;
  } else if (hostname.includes("cluster-") && hostname.includes("cloudworkstations.dev")) {
    BASE_URL = `https://${hostname}`;
  } else {
    BASE_URL = `http://${hostname}:5001`;
  }
}

const prependUrl = (url) => url && !url.startsWith("http") ? `${BASE_URL}${url}` : url;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", { withCredentials: true });
      const user = res.data;
      // Fix profilePic
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      get().connectSocket();
    } catch (err) {
      set({ authUser: null });
    }
  },
  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data, { withCredentials: true });
      const user = res.data;
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  },
  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data, { withCredentials: true });
      const user = res.data;
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  },
  updateProfile: async (formData) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      const user = res.data;
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  },
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;
    const newSocket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"], // Prefer WebSocket
      query: { userId: authUser._id },
    });
    newSocket.on("connect", () => console.log("✅ Socket connected:", newSocket.id));
    newSocket.on("connect_error", (err) => console.error("❌ Socket connect error:", err.message));
    newSocket.on("error", (err) => console.error("❌ Socket error:", err));
    newSocket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
    set({ socket: newSocket });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null });
    }
  },
}));