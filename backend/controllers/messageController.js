const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { io } = require("../socket"); // Import socket

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, content, attachments, media, files, replyTo } = req.body;

        let conversation = await Conversation.findById(conversationId);

        // Nếu chưa có cuộc trò chuyện -> Tạo mới
        if (!conversation) {
            conversation = new Conversation({
                type: "private",
                members: [senderId, req.body.receiverId]
            });
            await conversation.save();
        }

        // Tạo tin nhắn mới
        const newMessage = new Message({
            conversationId: conversation._id,
            senderId,
            content,
            attachments,
            media,
            files,
            replyTo
        });

        const savedMessage = await newMessage.save();

        // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
        conversation.lastMessage = savedMessage._id;
        await conversation.save();

        // Populate dữ liệu
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate("senderId", "name avatar")
            .populate("replyTo", "content senderId");

        // Gửi tin nhắn real-time bằng Socket.io
        io.to(conversation._id.toString()).emit("newMessage", populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Server error" });
    }
};
