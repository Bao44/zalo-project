const express = require("express");
const {
    create1vs1,
    getUserConversations,
    getConversation,
    getConversation1vs1,
    getConversationsGroup,
    createGroup,
    deleteConversation1vs1,
    updateAvataConversation,
    addMemberToGroup,
    removeMemberFromGroup,
    changeAdminGroup,
    changeSettingApproved
} = require("../controllers/conversationController");
const router = express.Router();

// API: Tạo cuộc trò chuyện 1-1
router.post("/create1vs1", create1vs1);

// API: Tạo cuộc trò chuyện nhóm
router.post("/createGroup", createGroup);

// API: Lấy danh sách cuộc trò chuyện của người dùng
router.get("/:userId", getUserConversations);

// API: Lấy thông tin 1 cuộc trò chuyện bằng id
router.get("/conversationId/:conversationId", getConversation);

// API: Lấy thông tin cuộc trò chuyện 1-1
router.get("/get-conversation1vs1/:user_id/:friend_id", getConversation1vs1);

// API: Lấy danh sách cuộc trò chuyện group
router.get("/group/:userId", getConversationsGroup);

// API: Xóa lịch sử trò chuyện của người dùng
router.patch("/:conversationId/delete/:userId", deleteConversation1vs1);

// API: Câp nhật avatar cuộc trò chuyện
router.patch("/:conversationId/avatar", updateAvataConversation);

// API: Thêm thành viên vào nhóm
router.patch("/:conversationId/add-member", addMemberToGroup);

// API: Xóa thành viên khỏi nhóm
router.patch("/:conversationId/remove-member", removeMemberFromGroup);

// API: Thay đổi admin nhóm
router.patch("/:conversationId/change-admin", changeAdminGroup);

// API: Thay đổi cài đặt duyệt
router.patch("/:conversationId/change-approved", changeSettingApproved);

module.exports = router;