const express = require("express");
const { create1vs1, getUserConversations, getConversation, getConversation1vs1 } = require("../controllers/conversationController");
const router = express.Router();

// API: Tạo cuộc trò chuyện 1-1
router.post("/create1vs1", create1vs1);

// API: Lấy danh sách cuộc trò chuyện của người dùng
router.get("/:userId", getUserConversations);

// API: Lấy thông tin 1 cuộc trò chuyện bằng id
router.get("/conversationId/:conversationId", getConversation);

// API: Lấy thông tin cuộc trò chuyện 1-1
router.get("/get-conversation1vs1/:user_id/:friend_id", getConversation1vs1);

module.exports = router;