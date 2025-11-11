import { Model } from "../lib/DB.js";

class MessageModel extends Model {
  constructor() {
    const schema = {
      senderId: { type: "number", required: true },
      receiverId: { type: "number", required: true },
      text: { type: "string" },
      image: { type: "string" },
      isRead: { type: "boolean", default: () => false },
      createdAt: { type: "string", default: () => new Date().toISOString() },
      updatedAt: { type: "string", default: () => new Date().toISOString() },
    };
    super("Messages", schema);
  }

  // Get conversation between two users
  findConversation(userA, userB) {
    return this.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    })
      .sort({ createdAt: 1 })
      .exec();
  }

  markAsRead(messageIds) {
    return this.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } }
    );
  }
}

export default new MessageModel();
