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

const appendMessageIfMissing = (messages, message) =>
  messages.some((existingMessage) =>
    String(existingMessage._id) === String(message._id)
  )
    ? messages
    : [...messages, message];

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
    const requestedUserId = String(userId);
    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const { prependUrl } = useAuthStore.getState();
      const mapped = Array.isArray(res.data)
        ? res.data.map((message) => ({
            ...message,
            image: prependUrl(message.image),
          }))
        : [];

      set((state) => {
        if (String(state.selectedUser?._id) !== requestedUserId) return state;
        return {
          messages: state.messages.reduce(
            appendMessageIfMissing,
            mapped
          ),
        };
      });
    } catch (error) {
      if (String(get().selectedUser?._id) === requestedUserId) {
        toast.error(error.response?.data?.message || "Failed to fetch messages");
        set({ messages: [] });
      }
    } finally {
      if (String(get().selectedUser?._id) === requestedUserId) {
        set({ isMessagesLoading: false });
      }
    }
  },

  sendMessage: async ({ text, image }) => {
    const { selectedUser } = get();
    if (!selectedUser) return false;

    const receiverId = selectedUser._id;
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

      const message = {
        ...res.data,
        image: prependUrl(res.data.image),
      };
      set((state) =>
        String(state.selectedUser?._id) === String(receiverId)
          ? { messages: appendMessageIfMissing(state.messages, message) }
          : state
      );
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return false;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !authUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      const isSelectedConversation =
        (String(newMessage.senderId) === String(selectedUser._id) &&
          String(newMessage.receiverId) === String(authUser._id)) ||
        (String(newMessage.senderId) === String(authUser._id) &&
          String(newMessage.receiverId) === String(selectedUser._id));
      if (!isSelectedConversation) return;

      const { prependUrl } = useAuthStore.getState();
      const message = {
        ...newMessage,
        image: prependUrl(newMessage.image),
      };
      set((state) => ({
        messages: appendMessageIfMissing(state.messages, message),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (user) =>
    set({ selectedUser: user, messages: [], isMessagesLoading: false }),

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