const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// API: Gửi tin nhắn
router.post("/send-message", messageController.sendMessage);

module.exports = router;