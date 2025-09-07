import User from "../models/user.model.js"
import Message from "../models/message.model.js"

// ✅ Sidebar Users
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    const filteredUsers = User.find({})
      .where({ _id: { $ne: loggedInUserId } }) // use $ne
      .select("-password")
      .exec()

    res.status(200).json(filteredUsers)
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ✅ Messages between 2 users
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params
    const myId = req.user._id

    const messages = Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    }).exec()

    res.status(200).json(messages)
  } catch (error) {
    console.error("Error in getMessages:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ✅ Send Message (with text + image)
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body
    const { id: receiverId } = req.params
    const senderId = req.user._id

    // multer puts uploaded file in req.file
    let imageUrl = null
    if (req.file) {
      // Save relative path (public/uploads/xxx.png)
      imageUrl = `/uploads/${req.file.filename}`
    }

    // create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    })

    res.status(201).json(newMessage)
  } catch (error) {
    console.error("Error in sendMessage:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}
