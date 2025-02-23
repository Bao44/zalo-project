const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Message = require("../models/Message");

// 📌 Tạo cuộc trò chuyện 1-1
const create1vs1 = async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    // Kiểm tra xem đã có cuộc trò chuyện chưa
    const existingConversation = await Conversation.findOne({
      type: "private",
      members: { $all: [user1, user2] }, // Kiểm tra cả 2 user đã tồn tại trong cùng cuộc trò chuyện
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Nếu chưa có, tạo mới
    const newConversation = new Conversation({
      name: "", // Private chat thường không cần name
      type: "private",
      members: [user1, user2], // Thêm 2 user
      avatar: "", // Avatar mặc định
      admin: null, // Không có admin vì là chat 1-1
      lastMessage: null, // Chưa có tin nhắn nào
    });

    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 API: Lấy danh sách cuộc trò chuyện của người dùng
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm tất cả các cuộc trò chuyện có userId trong danh sách members
    const conversations = await Conversation.find({ members: userId })
      .populate("members", "name avatar") 
      .populate("lastMessage", "type content createdAt") 
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { create1vs1, getUserConversations };
