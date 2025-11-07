import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import {
  getLocalIP
} from "../lib/utils.js";
import {
  getReceiverSocketId
} from "../lib/socket.js"

const ip = getLocalIP();
const PORT = process.env.PORT || 5001;
const backendUrl = `http://${ip}:${PORT}`;

// ✅ Sidebar Users
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: {
        $ne: loggedInUserId
      },
    })
    .select("-password")
    .exec();

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// ✅ Messages between 2 users
export const getMessages = async (req, res) => {
  try {
    const {
      id: userToChatId
    } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{
        senderId: myId, receiverId: parseInt(userToChatId)
      },
        {
          senderId: parseInt(userToChatId), receiverId: myId
        },
      ],
    })
    .sort({
      createdAt: 1
    })
    .exec();

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// ✅ Send Message (text + optional image)
export const sendMessage = async (req, res) => {
  try {
    const {
      text
    } = req.body;
    const receiverId = parseInt(req.params.id);
    const senderId = req.user._id;
    const receiverSocketId = getReceiverSocketId(receiverId)

    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    let imageUrl = null;
    if (req.file) imageUrl = `${backendUrl}/uploads/${req.file.filename}`;


    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage)

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};