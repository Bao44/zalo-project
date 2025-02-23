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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    avatar: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);

module.exports = mongoose.model("Conversation", ConversationSchema);
