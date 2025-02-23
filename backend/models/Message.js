const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
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
  media: [{
    fileType: { type: String, enum: ["video", "audio"], required: true },
    fileUrl: { type: String, required: true },
    duration: { type: Number, default: 0 }
  }],
  files: [{
    fileName: String,
    fileType: String,
    fileUrl: String
  }],
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },
  seen: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
