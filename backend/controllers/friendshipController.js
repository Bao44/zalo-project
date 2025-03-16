const Friendship = require('../models/Friendship');
const User = require('../models/User');
const { getSocketInstance } = require('../socket');

const friendshipController = {
    // Gửi lời mời kết bạn
    async sendFriendRequest(req, res) {
        try {
            const { senderId, receiverId, content, type } = req.body;

            // Kiểm tra xem đã gửi lời mời chưa
            const existingRequest = await Friendship.findOne({ sender_id: senderId, receiver_id: receiverId });
            if (existingRequest) {
                return res.status(400).json({ success: false, message: "Friend request already sent" });
            }

            // Kiểm tra xem đã là bạn chưa
            const existingFriend = await Friendship.findOne({ sender_id: senderId, receiver_id: receiverId, status: "accepted" });
            if (existingFriend) {
                return res.status(400).json({ success: false, message: "Already friends" });
            }

            // Tạo lời mời kết bạn
            const friendship = new Friendship({
                sender_id: senderId,
                receiver_id: receiverId,
                status: "pending",
                content: content,
                type: type,
            });
            await friendship.save();

            // Gửi thông báo real-time qua Socket.IO
            const io = getSocketInstance();
            const receiverSocketId = io.onlineUsers?.get(receiverId); // Lấy socketId từ Map onlineUsers
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("friend-request-notification", {
                    message: "You have a new friend request",
                    senderId,
                    content,
                    type,
                });
            }

            return res.status(200).json({ success: true, message: "Friend request sent successfully" });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Xác nhận hoặc từ chối lời mời kết bạn
    async respondToFriendRequest(req, res) {
        try {
            const { senderId, receiverId, status } = req.body;

            // Kiểm tra xem đã là bạn chưa
            const existingFriend = await Friendship.findOne({ sender_id: senderId, receiver_id: receiverId, status: "accepted" });
            if (existingFriend) {
                return res.status(400).json({ success: false, message: "Already friends" });
            }

            // Kiểm tra trạng thái hợp lệ
            if (!["accepted", "rejected"].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status" });
            }

            // Cập nhật trạng thái lời mời kết bạn
            await Friendship.updateOne({ sender_id: senderId, receiver_id: receiverId }, { status });

            // Gửi thông báo real-time qua Socket.IO
            const io = getSocketInstance();
            const senderSocketId = io.onlineUsers?.get(senderId); // Lấy socketId từ Map onlineUsers
            if (senderSocketId && status === "accepted") {
                io.to(senderSocketId).emit("friend-request-accepted", {
                    message: "Your friend request was accepted",
                    receiverId,
                });
            } else if (senderSocketId && status === "rejected") {
                io.to(senderSocketId).emit("friend-request-rejected", {
                    message: "Your friend request was rejected",
                    receiverId,
                });
            }

            return res.status(200).json({ success: true, message: "Friend request updated" });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    //Lấy danh sách lời mời kết bạn
    async getFriendRequests(req, res) {
        try {
            const { receiverId } = req.params;

            const now = new Date();
            const limitDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);

            const friendRequests = await Friendship.aggregate([
                { $match: { receiver_id: receiverId, status: "pending" } },
                {
                    $lookup: {
                        from: "users",
                        localField: "sender_id",
                        foreignField: "_id",
                        as: "sender",
                    },
                },
                { $unwind: "$sender" },
                {
                    $project: {
                        _id: 1,
                        "sender.name": 1,
                        "sender.email": 1,
                        "sender.avatar": 1,
                        "sender._id": 1,
                        content: 1,
                        createdAt: 1,
                        type: 1,
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                },
                { $sort: { year: -1, month: -1, createdAt: -1 } }, // Sắp xếp trước khi group
                {
                    $group: {
                        _id: { year: "$year", month: "$month" },
                        data: { $push: "$$ROOT" },
                    },
                },
            ]);


            let groupedRequests = [];
            let olderRequests = [];

            friendRequests.forEach((group) => {
                const { year, month } = group._id;
                const monthDate = new Date(year, month - 1, 1);

                if (monthDate >= limitDate) {
                    groupedRequests.push({
                        title: `Tháng ${month}, ${year}`,
                        data: group.data,
                    });
                } else {
                    olderRequests = olderRequests.concat(group.data);
                }
            });

            if (olderRequests.length > 0) {
                groupedRequests.push({ title: "Cũ hơn", data: olderRequests });
            }

            return res.status(200).json({ success: true, data: groupedRequests });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tìm bạn bè
    async searchFriends(req, res) {
        try {
            const { phone } = req.params;
            const friend = await User.find({ phone: phone });
            if (friend.length === 0) {
                return res.status(404).json({ success: false, message: "User not found" });
            }else{
                return res.status(200).json({ success: true, data: friend });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy danh sách bạn bè
    async getFriends(req, res) {
        try {
            const { userId } = req.params;

            // Tìm tất cả các mối quan hệ bạn bè của userId
            const friendships = await Friendship.find({
                $or: [
                    { sender_id: userId, status: "accepted" },
                    { receiver_id: userId, status: "accepted" },
                ],
            });

            // Lấy danh sách ID bạn bè (loại bỏ userId của chính người dùng)
            const friendIds = friendships.map(f =>
                f.sender_id.toString() === userId ? f.receiver_id : f.sender_id
            );

            // Truy vấn thông tin người dùng từ collection users
            const friends = await User.find({ _id: { $in: friendIds } }).select("-password -__v");

            return res.status(200).json({ success: true, data: friends });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = friendshipController;
