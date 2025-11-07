import {
  Model
} from "../lib/DB.js";

// Message-specific model extending the generic Model class
class MessageModel extends Model {
  constructor() {
    // Define the schema for the Messages collection
    const schema = {
      senderId: {
        type: 'number',
        required: true,
        validate: (value, field) => {
          if (!Number.isInteger(value) || value <= 0) {
            throw new Error(`${field} must be a positive integer`);
          }
        },
      },
      /*content: {
        type: 'string',
        required: true,
        validate: (value, field) => {
          if (value.trim().length === 0) {
            throw new Error(`${field} cannot be empty`);
          }
        },
      },*/
      text: {
        type: 'string'
      },
      image: {
        type: "string"
      },
      url: {
        type: "string"
      },
      groupImage: {
        type: "array"
      },
      receiverId: {
        type: 'number',
        required: false,
        validate: (value, field) => {
          if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
            throw new Error(`${field} must be a positive integer`);
          }
        },
      },
      isRead: {
        type: 'boolean',
        required: false,
        default: () => false,
        },
      };

      // Initialize the Model with 'Messages' collection and schema
      super('Messages', schema);
    }

    // Message-specific method: Find messages by sender
    findBySender(senderId) {
      return this.find({
        senderId: {
          $eq: senderId
        }
      }).exec();
    }

    // Message-specific method: Find messages between two users
    findConversation(senderId, receiverId) {
      return this.find({
        $or: [{
          senderId: {
            $eq: senderId
          }, receiverId: {
            $eq: receiverId
          }
        },
          {
            senderId: {
              $eq: receiverId
            }, receiverId: {
              $eq: senderId
            }
          },
        ],
      })
      .sort({
        timestamp: 1
      })
      .exec();
    }

    // Message-specific method: Mark messages as read
    markAsRead(messageIds) {
      return this.updateMany(
        {
          _id: {
            $in: messageIds
          }
        },
        {
          $set: {
            isRead: true
          }
        }
      );
    }
  }

  // Export a singleton instance of MessageModel
  export default new MessageModel();

  // Example usage:
  // const Message = require('./message.model');
  // Message.create({ senderId: 1, content: 'Hello!', receiverId: 2 });
  // Message.findBySender(1).then(messages => console.log(messages));
  // Message.findConversation(1, 2).then(conversation => console.log(conversation));
  // Message.markAsRead([1, 2]).then(result => console.log(result));