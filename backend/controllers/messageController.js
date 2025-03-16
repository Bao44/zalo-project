const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { getSocketInstance } = require("../socket");

const messageController = {
    async sendMessage(req, res) {
        try {
            const { conversationId, senderId, content, attachments, media, files, replyTo, receiverId } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!conversationId || !senderId) {
                return res.status(400).json({ error: "conversationId và senderId là bắt buộc" });
            }

            // Tìm hoặc tạo conversation
            let conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                if (!receiverId) {
                    return res.status(400).json({ error: "receiverId là bắt buộc khi tạo conversation mới" });
                }
                conversation = new Conversation({
                    type: "private",
                    members: [senderId, receiverId],
                });
                await conversation.save();
            }

            // Kiểm tra quyền truy cập
            if (!conversation.members.includes(senderId)) {
                return res.status(403).json({ error: "Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này" });
            }

            // Tạo tin nhắn mới
            const newMessage = new Message({
                conversationId: conversation._id,
                senderId,
                content: content || "",
                attachments: attachments || [],
                media: media || [],
                files: files || [],
                replyTo: replyTo || null,
            });

            const savedMessage = await newMessage.save();

            // Cập nhật tin nhắn cuối cùng của conversation
            conversation.lastMessage = savedMessage._id;
            await conversation.save();

            // Populate dữ liệu
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate("senderId", "name avatar")
                .populate("replyTo", "content senderId");

            // Populate conversation
            const conversationUpdate = await Conversation.findById(conversation._id)
                .populate("members", "name avatar")
                .populate("lastMessage", "type content createdAt");

            // Gửi thông báo real-time qua Socket.IO đến room
            const io = getSocketInstance();
            io.to(conversation._id.toString()).emit("newMessage", populatedMessage); // Gửi đến room dựa trên conversationId

            // Gửi thông báo real-time qua Socket.IO đến các user trong conversation
            conversation.members.forEach(memberId => {
                const memberSocketId = io.onlineUsers?.get(memberId);
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newConversation", conversationUpdate);
                }
            });

            res.status(201).json(populatedMessage);
        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },

    async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            if (!conversationId) {
                return res.status(400).json({ error: "conversationId là bắt buộc" });
            }

            const messages = await Message.find({ conversationId })
                .sort({ createdAt: 1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .populate("senderId", "name avatar")
                .populate("replyTo", "content senderId");

            res.json(messages.reverse());
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },
};

module.exports = messageController;