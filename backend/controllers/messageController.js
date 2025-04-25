const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { getSocketInstance } = require("../socket");
const cloudinary = require("../config/cloudinary");

const messageController = {
    // Gửi tin nhắn
    async sendMessage(req, res) {
        try {
            const { idTemp, conversationId, senderId, content, attachments, media, file, replyTo, receiverId, type } = req.body;

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
                        folder: "zalo/messages/hinh-anh",
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
                    conversationId: conversation?._id,
                    senderId,
                    content: content || "",
                    attachments: images,
                    media: media || null,
                    files: null,
                    replyTo: replyTo || null,
                    status: "sent",
                    type: type || "message"
                });

                const savedMessage = await newMessage.save();
                savedMessages.push(savedMessage);

                // Populate và gửi tin nhắn real-time
                const populatedMessage = await Message.findById(savedMessage._id)
                    .populate("senderId", "name avatar")
                    .populate({
                        path: "replyTo",
                        select: "content senderId attachments files media",
                        populate: {
                            path: "senderId",
                            select: "name"
                        }
                    });
                io.to(conversation._id.toString()).emit("newMessage", populatedMessage, idTemp);
            }

            // Upload và tạo tin nhắn riêng cho file (chỉ 1 file duy nhất)
            if (file) {
                if (!file.uri) {
                    throw new Error(`Thiếu dữ liệu base64 cho file: ${file.name}`);
                }

                const mimeType = file.type || 'application/octet-stream';
                const dataUri = `data:${mimeType};base64,${file.uri}`;

                let result;

                if (file.type === "audio/m4a") {
                    result = await cloudinary.uploader.upload(dataUri, {
                        folder: "zalo/messages/audio",
                        resource_type: "auto",
                        // public_id: file.name,
                    });
                } else {
                    result = await cloudinary.uploader.upload(dataUri, {
                        folder: "zalo/messages/files",
                        resource_type: "auto",
                        // public_id: file.name,
                    });
                }

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
                    media: media || null,
                    files: fileData,
                    replyTo: replyTo || null,
                    status: "sent",
                });

                const savedFileMessage = await fileMessage.save();
                savedMessages.push(savedFileMessage);

                const populatedFileMessage = await Message.findById(savedFileMessage._id)
                    .populate("senderId", "name avatar")
                    .populate({
                        path: "replyTo",
                        select: "content senderId attachments files media",
                        populate: {
                            path: "senderId",
                            select: "name"
                        }
                    });

                // Gửi tin nhắn real-time cho file
                io.to(conversation._id.toString()).emit("newMessage", populatedFileMessage, idTemp);
            }

            // Upload và tạo tin nhắn riêng cho video (nếu có)
            if (media) {
                if (!media.uri) {
                    throw new Error(`Thiếu dữ liệu base64 cho video: ${media.name}`);
                }

                const mimeType = media.type || 'video/mp4';
                const dataUri = `data:${mimeType};base64,${media.uri}`;

                const result = await cloudinary.uploader.upload(dataUri, {
                    folder: "zalo/messages/videos",
                    resource_type: "video",
                    // public_id: media.name,
                });

                const videoData = {
                    fileName: media.name,
                    fileType: media.type,
                    fileUrl: result.secure_url,
                };

                // Tạo tin nhắn riêng cho video này
                const videoMessage = new Message({
                    conversationId: conversation._id,
                    senderId,
                    content: "",
                    attachments: [],
                    media: videoData,
                    files: null,
                    replyTo: replyTo || null,
                    status: "sent",
                });

                const savedVideoMessage = await videoMessage.save();
                savedMessages.push(savedVideoMessage);

                const populatedVideoMessage = await Message.findById(savedVideoMessage._id)
                    .populate("senderId", "name avatar")
                    .populate({
                        path: "replyTo",
                        select: "content senderId attachments files media",
                        populate: {
                            path: "senderId",
                            select: "name"
                        }
                    });

                // Gửi tin nhắn real-time cho video
                io.to(conversation._id.toString()).emit("newMessage", populatedVideoMessage, idTemp);
            }

            // Cập nhật lastMessage cho conversation
            if (savedMessages.length > 0) {
                conversation.lastMessage = savedMessages[savedMessages.length - 1]._id;
                await conversation.save();
            }

            // Populate conversation và gửi cập nhật
            const conversationUpdate = await Conversation.findById(conversation._id)
                .populate("members", "name avatar")
                .populate("lastMessage", "type content createdAt attachments media files senderId seen replyTo revoked");

            conversation.members.forEach(memberId => {
                const memberSocketId = io.onlineUsers?.get(memberId);
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newConversation", conversationUpdate);
                }
            });

            // Trả về tin nhắn cuối cùng hoặc danh sách tin nhắn (tùy yêu cầu)
            const lastPopulatedMessage = await Message.findById(savedMessages[savedMessages.length - 1]._id)
                .populate("senderId", "name avatar")
                .populate({
                    path: "replyTo",
                    select: "content senderId attachments files media",
                    populate: {
                        path: "senderId",
                        select: "name"
                    }
                });

            res.status(201).json(lastPopulatedMessage);
        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },

    // Lấy danh sách tin nhắn trong một cuộc trò chuyện
    async getMessages(req, res) {
        try {
            const { conversationId } = req.params;

            if (!conversationId) {
                return res.status(400).json({ error: "conversationId là bắt buộc" });
            }

            const messages = await Message.find({ conversationId })
                .sort({ createdAt: 1 })
                .populate("senderId", "name avatar")
                .populate({
                    path: "replyTo",
                    select: "content senderId attachments files media",
                    populate: {
                        path: "senderId",
                        select: "name"
                    }
                }); // Giới hạn số lượng tin nhắn trả về
            res.json(messages.reverse());
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },

    // Cập nhật trạng thái đã xem cho tin nhắn
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
    },

    // Xoa tin nhan(add user xoa tin nhan)
    async deleteMessage(req, res) {
        const { messageId, userId } = req.params;

        // Kiểm tra đầu vào
        if (!messageId || !userId) {
            return res.status(400).json({ error: "messageId và userId là bắt buộc" });
        }

        try {
            // Tìm tin nhắn theo ID
            const message = await Message.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: "Tin nhắn không tồn tại" });
            }

            // Kiểm tra xem người dùng đã đánh dấu tin nhắn này là "đã xóa" chưa
            if (message.removed.includes(userId)) {
                return res.status(400).json({ error: "Người dùng đã xóa tin nhắn này rồi" });
            }

            // Thêm userId vào mảng removed (xóa mềm)
            message.removed.push(userId);
            await message.save();

            // Trả về phản hồi thành công
            return res.status(200).json({
                message: "Xóa tin nhắn thành công",
                data: {
                    messageId: message._id,
                    removed: message.removed
                }
            });
        } catch (error) {
            console.error("Lỗi khi xóa tin nhắn:", error);
            return res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },

    // Thu hồi tin nhắn (undo delete message)
    async undoDeleteMessage(req, res) {
        const { messageId, userId } = req.params;

        // Kiểm tra đầu vào
        if (!messageId || !userId) {
            return res.status(400).json({ error: "messageId và userId là bắt buộc" });
        }

        try {
            // Tìm tin nhắn theo ID
            const message = await Message.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: "Tin nhắn không tồn tại" });
            }

            // Kiểm tra tư cách người dùng có quyền thu hồi tin nhắn này không
            if (message.senderId.toString() !== userId) {
                return res.status(403).json({ error: "Bạn không có quyền thu hồi tin nhắn này" });
            }

            // Kiểm tra xem tin nhắn đã bị thu hồi chưa
            if (message.revoked) {
                return res.status(400).json({ error: "Tin nhắn đã được thu hồi trước đó" });
            }

            // Cập nhật trạng thái thu hồi
            message.revoked = true;
            await message.save();

            // Gửi sự kiện socket thông báo thu hồi tin nhắn
            const io = getSocketInstance();
            io.to(message.conversationId.toString()).emit("messageRevoked", {
                conversationId: message.conversationId.toString(),
                messageId: message._id.toString(),
                userId,
            });

            // Trả về phản hồi thành công
            return res.status(200).json({
                message: "Thu hồi tin nhắn thành công",
                data: {
                    messageId: message._id,
                    revoked: message.revoked,
                },
            });
        } catch (error) {
            console.error("Lỗi khi thu hồi tin nhắn:", error);
            return res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },

    // Tìm tin nhắn trước đó trong cùng một cuộc trò chuyện
    async findPreviousMessage(req, res) {
        const { messageId, conversationId } = req.params;
        try {
            // Lấy thông tin tin nhắn chỉ định
            const specifiedMessage = await Message.findById(messageId);
            if (!specifiedMessage) {
                throw new Error("Tin nhắn chỉ định không tồn tại");
            }

            // Tìm tin nhắn ngay trước nó trong cùng conversationId
            const previousMessage = await Message.findOne({
                conversationId: conversationId, // Lọc theo conversationId
                _id: { $ne: messageId }, // Loại bỏ chính tin nhắn chỉ định
                createdAt: { $lt: specifiedMessage.createdAt }, // Tin nhắn có thời gian trước tin nhắn chỉ định
            })
                .sort({ createdAt: -1 }) // Sắp xếp giảm dần để lấy tin nhắn gần nhất
                .exec();

            if (!previousMessage) {
                console.log("Không có tin nhắn nào trước tin nhắn này trong cuộc hội thoại.");
                return null;
            }

            console.log("Tin nhắn trước đó:", previousMessage);
            return previousMessage;
        } catch (error) {
            console.error("Lỗi:", error.message);
            return null;
        }
    },

    // Thích tin nhắn
    async likeMessage(req, res) {
        const { messageId, likeStatus, userId } = req.body;

        if (!messageId || !userId) {
            return res.status(400).json({ error: "messageId và userId là bắt buộc" });
        }

        try {
            let updateQuery;
            if (likeStatus === "like") {
                updateQuery = [
                    {
                        $set: {
                            like: {
                                $cond: {
                                    if: { $in: [userId, "$like.userId"] },
                                    then: {
                                        $map: {
                                            input: "$like",
                                            as: "like",
                                            in: {
                                                $cond: {
                                                    if: { $eq: ["$$like.userId", userId] },
                                                    then: {
                                                        userId: "$$like.userId",
                                                        totalLike: { $add: ["$$like.totalLike", 1] }
                                                    },
                                                    else: "$$like"
                                                }
                                            }
                                        }
                                    },
                                    else: { $concatArrays: ["$like", [{ userId, totalLike: 1 }]] }
                                }
                            }
                        }
                    }
                ];
            } else if (likeStatus === "dislike") {
                updateQuery = { $pull: { like: { userId } } };
            } else {
                return res.status(400).json({ error: "likeStatus không hợp lệ" });
            }

            const message = await Message.findByIdAndUpdate(
                messageId,
                updateQuery,
                { new: true }
            )
                .populate("senderId", "name avatar")
                .populate({
                    path: "replyTo",
                    select: "content senderId attachments files media",
                    populate: {
                        path: "senderId",
                        select: "name"
                    }
                });
            if (!message) {
                return res.status(404).json({ error: "Tin nhắn không tồn tại" });
            }

            const io = getSocketInstance();
            io.to(message.conversationId.toString()).emit("messageLiked", {
                savedMessage: message,
                senderUserLike: userId,
                updatedAt: new Date().toISOString() // Thêm thời gian cập nhật
            });

            return res.status(200).json({
                message: likeStatus === "like" ? "Thích tin nhắn thành công" : "Bỏ thích tin nhắn thành công",
                data: {
                    messageId: message._id,
                    like: message.like
                }
            });
        } catch (error) {
            console.error("Lỗi khi thích tin nhắn:", error);
            return res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
        }
    },
};

module.exports = messageController;