import fs from "fs";
import {
  Message
} from "../models/message.model.js";
import {
  getBaseUrl
} from "../utils/getBaseUrl.js";

// 📨 Send message (with optional image)
export const sendMessage = async (req, res) => {
  try {
    const {
      text,
      receiverId
    } = req.body;
    const senderId = req.user._id;
    const imageUrl = req.file ? `${getBaseUrl()}/uploads/${req.file.filename}`: null;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      createdAt: new Date(),
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// 💬 Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const myId = Number(req.user._id);
    const userToChatId = Number(req.params.id);

    const messages = await Message.find(
      (m) =>
      (m.senderId === myId && m.receiverId === userToChatId) ||
      (m.senderId === userToChatId && m.receiverId === myId)
    );

    res.json(messages);
  } catch (err) {
    console.error("Error getting messages:", err.message);
    res.status(500).json({
      message: "Server error"
    });
  }
};