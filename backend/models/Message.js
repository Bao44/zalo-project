const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  senderId: {
    type: String,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  attachments: [{
    type: String // Chứa link ảnh
  }],
  media: {
    fileName: String,
    fileType: String,
    fileUrl: String
  },
  files: {
    fileName: String,
    fileType: String,
    fileUrl: String
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },
  seen: [{
    type: String,
    ref: "User"
  }],
  like: [
    {
      userId: { type: String, ref: "User" },
      totalLike: { type: Number }
    }
  ],
  revoked: { type: Boolean, default: false },
  removed: [{
    type: String, ref: "User"
  }],
  type: {
    type: String,
    default: "message"
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
