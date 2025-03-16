const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// API: Gửi tin nhắn
router.post("/send-message", messageController.sendMessage);

// API: Lấy tin nhắn trong cuộc trò chuyện
router.get("/get-messages/:conversationId", messageController.getMessages);
module.exports = router;