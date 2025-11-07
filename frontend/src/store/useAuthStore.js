import {
  create
} from "zustand";
import {
  axiosInstance
} from "../lib/axios.js";
import toast from "react-hot-toast";
import {
  io
} from "socket.io-client";

let BASE_URL = "";

// Determine backend URL
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

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true
      });
      set({
        authUser: res.data
      });
      get().connectSocket();
    } catch (err) {
      console.error("Error in checkAuth:", err);
      set({
        authUser: null
      });
    } finally {
      set({
        isCheckingAuth: false
      });
    }
  },

  signup: async (data) => {
    set({
      isSigningUp: true
    });
    try {
      const res = await axiosInstance.post("/auth/signup", data, {
        withCredentials: true
      });
      set({
        authUser: res.data
      });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      set({
        isSigningUp: false
      });
    }
  },
  login: async (data) => {
    set({
      isLoggingIn: true
    });
    try {
      const res = await axiosInstance.post("/auth/login", data, {
        withCredentials: true
      });
      set({
        authUser: res.data
      });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      set({
        isLoggingIn: false
      });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, {
        withCredentials: true
      });
      get().disconnectSocket();
      set({
        authUser: null
      });
      toast.success("Logged out successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (formData) => {
    set({
      isUpdatingProfile: true
    });
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true,
      });
      set({
        authUser: res.data
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      set({
        isUpdatingProfile: false
      });
    }
  },

  connectSocket: () => {
    const {
      authUser, socket
    } = get();
    if (!authUser || socket?.connected) return;
    const newSocket = io(import.meta.env.MODE === "development" ? BASE_URL: "/", {
      withCredentials: true,
      transports: ["polling", "websocket"], // ✅ same as backend
      query: {
        userId: authUser?._id,
      },
    });


    newSocket.on("connect", () => console.log("✅ Socket connected:", newSocket.id));
    newSocket.on("connect_error", (err) => console.error("❌ Socket connection error:", err));
    newSocket.on("getOnlineUsers", (userIds) => set({
      onlineUsers: userIds
    }));

    set({
      socket: newSocket
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({
        socket: null
      });
    }
  },
}));