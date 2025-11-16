// ✅ useAuthStore.js — optimized for Cloud Workstations, LAN, and Production
import { create } from "zustand";
import { axiosInstance } from "/src/lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { getDynamicBackendUrl } from "../lib/getDynamicBackendUrl.js";

let BACKEND_URL = getDynamicBackendUrl();
console.log(BACKEND_URL);

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

if (typeof window !== "undefined") {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    BACKEND_URL = "http://localhost:5001";
  } else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    BACKEND_URL = `http://${hostname}:5001`;
  } else if (
    hostname.includes("cluster-") &&
    hostname.includes("cloudworkstations.dev")
  ) {
    // Backend URL: same subdomain but port 5001
    BACKEND_URL = `https://${
      hostname.split(".")[0]
    }.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev:5001`;
  } else {
    BACKEND_URL = `http://${hostname}:5001`;
  }
}


console.log("🌐 Using backend:", BACKEND_URL);

// ✅ Consistent helper for images and file URLs
const prependUrl = (url) =>
  url && !url.startsWith("http") ? `${BACKEND_URL}${url}` : url;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],

  // ✅ Check authentication state
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true,
      });
      const user = res.data;
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    }
  },

  // ✅ Signup new user
  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data, {
        withCredentials: true,
      });
      const user = res.data;
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  },

  // ✅ Login user
  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data, {
        withCredentials: true,
      });
      const user = res.data;
      user.profilePic = prependUrl(user.profilePic);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  },

  // ✅ Update user profile
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
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout")
      set({ authUser: null })
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

  // ✅ Handle socket connection
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      query: { userId: authUser._id },
    });

    newSocket.on("connect", () =>
      console.log("✅ Socket connected:", newSocket.id)
    );

    newSocket.on("connect_error", (err) =>
      console.error("❌ Socket connect error:", err.message)
    );

    newSocket.on("error", (err) => console.error("❌ Socket error:", err));

    newSocket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));

    set({ socket: newSocket });
  },

  // ✅ Disconnect socket cleanly
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null });
    }
  },

  // ✅ Exported prependUrl helper for reuse in chat store
  prependUrl,
}));
