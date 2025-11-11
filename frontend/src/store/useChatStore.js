import {
  create
} from "zustand";
import toast from "react-hot-toast";
import {
  axiosInstance
} from "../lib/axios.js";
import {
  useAuthStore
} from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {},

  getUsers: async () => {
    set({
      isUsersLoading: true
    });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({
        users: Array.isArray(res.data) ? res.data: []
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      set({
        users: []
      });
    } finally {
      set({
        isUsersLoading: false
      });
    }
  },

  getMessages: async (userId) => {
    set({
      isMessagesLoading: true
    });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const { prependUrl } = useAuthStore.getState();
      const mapped = Array.isArray(res.data) ? res.data.map((m) => ({
        ...m,
        image: prependUrl(m.image),
      })) : [];
      set({ messages: mapped });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({
        messages: []
      });
    } finally {
      set({
        isMessagesLoading: false
      });
    }
  },

  sendMessage: async ({
    receiverId, text, image
  }) => {
    const {
      selectedUser, messages
    } = get();
    try {
      const formData = new FormData();
      formData.append("receiverId", receiverId);
      if (text) formData.append("text", text);
      if (image) formData.append("image", image);

      const { prependUrl } = useAuthStore.getState();
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true,
        }
      );

      const msg = res.data
      msg.image = prependUrl(msg.image)
      set((state) => ({ messages: [...state.messages, msg] }));

      // Emit to socket for live updates
      const socket = useAuthStore.getState().socket;
      if (socket && socket.connected) {
        socket.emit("send-message", res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const {
      selectedUser
    } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (isMessageFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage]
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (user) => set({
    selectedUser: user
  }),

  setTyping: (isTyping) => {
    const {
      selectedUser
    } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) return;

    socket.emit("typing", {
      receiverId: selectedUser._id, isTyping
    });
  },

  addMessage: (message) => {
    const {
      messages
    } = get();
    set({
      messages: [...messages, message]
    });
  },

  setTypingUser: (userId, isTyping) => {
    const {
      typingUsers
    } = get();
    set({
      typingUsers: {
        ...typingUsers, [userId]: isTyping
      }
    });
  },
}));