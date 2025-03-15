const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// POST - Tạo hoặc cập nhật bài đăng
router.post("/posts", postController.createOrUpdatePost);

// GET - Lấy danh sách bài đăng
router.get("/posts", postController.getPosts);

// GET - Lấy chi tiết bài đăng
router.get("/posts/:postId", postController.getPostDetails);

// POST - Thêm like vào bài đăng
router.post("/posts/like", postController.likePost);

// DELETE - Xóa like khỏi bài đăng
router.delete("/posts/like/:postId/:userId", postController.unlikePost);

// POST - Thêm bình luận vào bài đăng
router.post("/posts/comment", postController.addComment);

// DELETE - Xóa bình luận
router.delete("/posts/comment/:commentId", postController.deleteComment);

// DELETE - Xóa bài đăng
router.delete("/posts/:postId", postController.deletePost);

module.exports = router;
