import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getBaseUrl } from "../utils/getBaseUrl.js";

// Helper to get full image URL
const getFullImage = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith("http")
    ? imagePath
    : `${getBaseUrl()}/uploads/${imagePath.split("/").pop()}`;
};

// ------------------- GET USERS FOR SIDEBAR -------------------
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = Number(req.user._id);

    const users = await User.find({ _id: { $ne: loggedInUserId } }).exec();

    const result = users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      profilePic: getFullImage(u.profilePic),
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getUsersForSidebar:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ------------------- SEND MESSAGE -------------------
export const sendMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = Number(req.user._id);

    const imageUrl = req.file
      ? `${getBaseUrl()}/uploads/${req.file.filename}`
      : null;

    const newMessage = await Message.create({
      senderId,
      receiverId: Number(receiverId),
      text,
      image: imageUrl,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET MESSAGES BETWEEN TWO USERS -------------------
export const getMessages = async (req, res) => {
  try {
    const myId = Number(req.user._id);
    const userToChatId = Number(req.params.id);

    const messages = await Message.findConversation(myId, userToChatId);

    const formatted = messages.map((m) => ({
      ...m,
      image: getFullImage(m.image),
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error getting messages:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
