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

// API: Xóa tin nhắn
router.post("/delete-message/:messageId/:userId", messageController.deleteMessage);

// API: Thu hồi tin nhắn
router.post("/undo-message/:messageId/:userId", messageController.undoDeleteMessage);

// API: Tìm kiếm tin nhắn trước đó trong cuộc trò chuyện
router.get("/search-messagePrevious/:conversationId/:messageId", messageController.findPreviousMessage);

// API: Thích tin nhắn
router.post("/like-or-dislike-message", messageController.likeMessage);
module.exports = router;