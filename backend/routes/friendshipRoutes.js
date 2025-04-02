const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

// Gửi lời mời kết bạn
router.post('/send-friend-request', friendshipController.sendFriendRequest);

// Xác nhận hoặc từ chối lời mời kết bạn
router.post('/respond-friend-request', friendshipController.respondToFriendRequest);

// Lấy danh sách bạn bè
router.get('/friends/:userId', friendshipController.getFriends);

//Tìm kiếm bạn bè
router.get('/search-friends/:phone', friendshipController.searchFriends);

// Lấy danh sách lời mời kết bạn
router.get('/friend-requests/:receiverId', friendshipController.getFriendRequests);

// Check da là bạn hay chưa
router.get('/check-friend/:userId/:friendId', friendshipController.checkFriendship);

module.exports = router;