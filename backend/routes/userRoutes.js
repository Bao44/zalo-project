const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Đồng bộ người dùng từ Supabase sang MongoDB
router.post('/sync', userController.syncUserToMongoDB);

// Lấy thông tin người dùng từ Supabase và đồng bộ sang MongoDB
router.get('/:userId', userController.getUserData);

// Cập nhật thông tin người dùng
router.put('/:userId', userController.updateUser);

// Lấy thông tin người dùng từ MongoDB
router.get('/mongo/:supabaseId', userController.getUserFromMongoDB);

// Lấy thông tin người dùng theo email từ MongoDB
router.get('/email/:email', userController.getUserByEmailFromMongoDB);

// Thêm bạn bè
router.post('/:supabaseId/friends', userController.addFriend);

// Thêm cuộc trò chuyện
router.post('/:supabaseId/conversations', userController.addConversation);

module.exports = router;