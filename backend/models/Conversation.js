const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    members: [
      {
        type: String,
        ref: "User",
      }
    ],
    avatar: {
      type: String,
      default: "",
    },
    admin: {
      type: String,
      ref: "User",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    delete_history: [
      {
        _id: false,
        userId: {
          type: String,
          ref: "User",
        },
        time_delete: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    approvedMembers: {
      type: Boolean,
      default: false,
    },
    listApprovedMembers: [
      {
        type: String,
        ref: "User",
      }
    ],
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);

module.exports = mongoose.model("Conversation", ConversationSchema);
