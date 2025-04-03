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

            // Tạo tin nhắn cho nội dung văn bản hoặc ảnh (nếu có)
            let savedMessages = [];
            const io = getSocketInstance();

            if (content || images.length > 0) {
                const newMessage = new Message({
                    conversationId: conversation._id,
                    senderId,
                    content: content || "",
                    attachments: images,
                    media: media || [],
                    files: [],
                    replyTo: replyTo || null,
                    status: "sent",
                });

                const savedMessage = await newMessage.save();
                savedMessages.push(savedMessage);

                // Populate và gửi tin nhắn real-time
                const populatedMessage = await Message.findById(savedMessage._id)
                    .populate("senderId", "name avatar")
                    .populate("replyTo", "content senderId");
                io.to(conversation._id.toString()).emit("newMessage", populatedMessage, idTemp);
            }

            // Upload và tạo tin nhắn riêng cho từng file
            if (files && files.length > 0) {
                const uploadPromises = files.map(async (file) => {
                    if (!file.uri) {
                        throw new Error(`Thiếu dữ liệu base64 cho file: ${file.name}`);
                    }

                    const mimeType = file.type || 'application/octet-stream';
                    const dataUri = `data:${mimeType};base64,${file.uri}`;

                    const result = await cloudinary.uploader.upload(dataUri, {
                        folder: "files",
                        resource_type: "auto",
                        public_id: file.name,
                    });

                    const fileData = {
                        fileName: file.name,
                        fileType: file.type,
                        fileUrl: result.secure_url,
                    };

                    // Tạo tin nhắn riêng cho file này
                    const fileMessage = new Message({
                        conversationId: conversation._id,
                        senderId,
                        content: "",
                        attachments: [],
                        media: [],
                        files: [fileData],
                        replyTo: replyTo || null,
                        status: "sent",
                    });

                    const savedFileMessage = await fileMessage.save();
                    const populatedFileMessage = await Message.findById(savedFileMessage._id)
                        .populate("senderId", "name avatar")
                        .populate("replyTo", "content senderId");

                    // Gửi tin nhắn real-time cho file
                    io.to(conversation._id.toString()).emit("newMessage", populatedFileMessage, idTemp);

                    return savedFileMessage;
                });

                const fileMessages = await Promise.all(uploadPromises);
                savedMessages = savedMessages.concat(fileMessages);
            }

            // Cập nhật lastMessage cho conversation
            if (savedMessages.length > 0) {
                conversation.lastMessage = savedMessages[savedMessages.length - 1]._id;
                await conversation.save();
            }

            // Populate conversation và gửi cập nhật
            const conversationUpdate = await Conversation.findById(conversation._id)
                .populate("members", "name avatar")
                .populate("lastMessage", "type content createdAt attachments media files senderId seen");

            conversation.members.forEach(memberId => {
                const memberSocketId = io.onlineUsers?.get(memberId);
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newConversation", conversationUpdate);
                }
            });

            // Trả về tin nhắn cuối cùng hoặc danh sách tin nhắn (tùy yêu cầu)
            const lastPopulatedMessage = await Message.findById(savedMessages[savedMessages.length - 1]._id)
                .populate("senderId", "name avatar")
                .populate("replyTo", "content senderId");

            res.status(201).json(lastPopulatedMessage);
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

    async addUserSeen(req, res) {
        const { conversationId, userId } = req.body;
        if (!conversationId || !userId) {
            return res.status(400).json({ error: "conversationId và userId là bắt buộc" });
        }
        try {
            // Lấy danh sách tin nhắn trước khi cập nhật để biết những tin nhắn nào bị ảnh hưởng
            const messagesToUpdate = await Message.find({
                conversationId,
                senderId: { $ne: userId }, // Tin nhắn không phải do userId gửi
                seen: { $ne: userId } // Tin nhắn chưa được userId xem
            }).select('_id'); // Chỉ lấy trường _id để tối ưu

            // Cập nhật các tin nhắn
            const updatedMessages = await Message.updateMany(
                {
                    conversationId,
                    senderId: { $ne: userId },
                    seen: { $ne: userId }
                },
                { $addToSet: { seen: userId } }
            );

            if (updatedMessages.modifiedCount === 0) {
                return res.status(404).json({ error: "Không có tin nhắn nào để cập nhật" });
            }

            // Lấy instance socket
            const io = getSocketInstance();

            // Gửi sự kiện "messageSeen" với danh sách ID tin nhắn được cập nhật
            io.to(conversationId.toString()).emit("messageSeen", {
                conversationId,
                userId,
                updatedMessageIds: messagesToUpdate.map(msg => msg._id.toString()), // Danh sách ID tin nhắn
                updatedCount: updatedMessages.modifiedCount
            });

            res.status(200).json({ message: "Cập nhật trạng thái đã xem thành công" });
        } catch (error) {
            console.error("Error updating message:", error);
            res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },

    //Đếm tin nhắn chưa đọc của một người dùng trong một cuộc trò chuyện
    async countUnreadMessages(req, res) {
        const { conversationId, userId } = req.query;
        if (!conversationId || !userId) {
            return res.status(400).json({ error: "conversationId và userId là bắt buộc" });
        }
        try {
            const count = await Message.countDocuments({
                conversationId,
                senderId: { $ne: userId },
                seen: { $ne: userId }
            });
            res.status(200).json({ count });
        } catch (error) {
            console.error("Error counting unread messages:", error);
            res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    }
};

module.exports = messageController;