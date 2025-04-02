const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// API: Gửi tin nhắn
router.post("/send-message", messageController.sendMessage);

// API: Lấy tin nhắn trong cuộc trò chuyện
router.get("/get-messages/:conversationId", messageController.getMessages);

// API: Cập nhật trạng thái đã xem cho người dùng
router.post("/add-user-seen", messageController.addUserSeen);

// API: Đếm số lượng tin nhắn chưa đọc
router.get("/count-unread-messages", messageController.countUnreadMessages);
module.exports = router;