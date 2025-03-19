const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { getSocketInstance } = require("../socket");
const cloudinary = require("../config/cloudinary");

const messageController = {
    async sendMessage(req, res) {
        try {
            const { idTemp, conversationId, senderId, content, attachments, media, files, replyTo, receiverId } = req.body;

            if (!conversationId || !senderId) {
                return res.status(400).json({ error: "conversationId và senderId là bắt buộc" });
            }

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

            if (!conversation.members.includes(senderId)) {
                return res.status(403).json({ error: "Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này" });
            }

            let images = [];

            // Upload ảnh TRƯỚC khi lưu tin nhắn
            if (attachments && attachments.length > 0) {
                const uploadPromises = attachments.map(async (attachment) => {
                    if (!attachment.fileUri) throw new Error("Thiếu dữ liệu fileBase64");

                    const resourceType = attachment.isImage ? "image" : "raw";
                    const result = await cloudinary.uploader.upload(`data:image/png;base64,${attachment.fileUri}`, {
                        folder: attachment.folderName || "uploads",
                        resource_type: resourceType,
                    });

                    return result.secure_url;
                });

                images = await Promise.all(uploadPromises);
            }

            // Tạo tin nhắn sau khi upload xong
            const newMessage = new Message({
                conversationId: conversation._id,
                senderId,
                content: content || "",
                attachments: images, // Ảnh đã có đầy đủ trước khi lưu
                media: media || [],
                files: files || [],
                replyTo: replyTo || null,
                status: "sent", // Không còn "uploading"
            });

            const savedMessage = await newMessage.save();

            // Cập nhật tin nhắn cuối cùng trong conversation
            conversation.lastMessage = savedMessage._id;
            await conversation.save();

            // Populate dữ liệu tin nhắn
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate("senderId", "name avatar")
                .populate("replyTo", "content senderId");

            // Gửi tin nhắn real-time (không bị thiếu ảnh)
            const io = getSocketInstance();
            io.to(conversation._id.toString()).emit("newMessage", populatedMessage, idTemp);

            // Populate conversation và gửi cập nhật đến user trong conversation
            const conversationUpdate = await Conversation.findById(conversation._id)
                .populate("members", "name avatar")
                .populate("lastMessage", "type content createdAt");

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