const Conversation = require("../models/Conversation");
const cloudinary = require("../config/cloudinary");

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

// 📌 API: Tạo cuộc trò chuyện group
const createGroup = async (req, res) => {
  const { admin, nameGroup, avatar, members } = req.body;
  try {
    //Kiểm tra dữ liệu có tồn tại
    if (!admin || members.length < 2) {
      return res.status(400).json({ message: "Nhóm phải có ít nhất 2 thành viên và cần có tên nhóm." });
    }

    let avatarUrl = "";
    //loadAvatar
    if (avatar?.fileUri !== null) {
      const uploadPromises = async () => {
        if (!avatar) throw new Error("Thiếu dữ liệu fileBase64");

        const resourceType = avatar.isImage ? "image" : "raw";
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${avatar.fileUri}`, {
          folder: "zalo/avatar-group-chat",
          resource_type: resourceType,
        });
        return result.secure_url;
      };

      if (avatar) {
        avatarUrl = await uploadPromises(); // Chờ Promise hoàn thành
      }
    }

    let mb = members.map((u) => u?._id);
    mb.push(admin);

    const newGroup = new Conversation({
      admin: admin,
      name: nameGroup,
      type: "group",
      members: mb,
      avatar: avatarUrl,
      lastMessage: null,
    });

    const savedConversation = await newGroup.save();

    // Gửi socket đến tất cả members
    io.to(members.map((u) => u?._id).concat(admin)).emit("newConversation", savedConversation);

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
      .populate("lastMessage", "type content createdAt attachments media files senderId seen replyTo revoked")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 API: Lấy thông tin 1 cuộc trò chuyện bằng id
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate("members", "name avatar")
      .populate("lastMessage", "type content createdAt")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Lấy thông tin cuộc trò chuyện 1-1
const getConversation1vs1 = async (req, res) => {
  try {
    const { user_id, friend_id } = req.params;
    const conversation = await Conversation.findOne({
      type: "private",
      members: { $all: [user_id, friend_id] },
    })
      .populate("members", "name avatar")
      .populate("lastMessage", "type content createdAt")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Lấy tất cả các cuộc trò chuyện group của người dùng
const getConversationsGroup = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ type: "group", members: userId })
      .populate("members", "name avatar")
      .populate("lastMessage", "type content createdAt")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
}

// 📌 Xóa cuộc trò chuyện 1 vs 1 (cập nhật lại delete_History)
const deleteConversation1vs1 = async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    const time_delete = new Date();

    // Tìm conversation trước để kiểm tra
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Kiểm tra xem userId đã có trong delete_history chưa
    const existingDeleteEntry = conversation.delete_history.find(
      entry => entry.userId.toString() === userId
    );

    let updatedConversation;
    if (existingDeleteEntry) {
      // Nếu đã có, chỉ cập nhật time_delete
      updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $set: {
            "delete_history.$[elem].time_delete": time_delete
          }
        },
        {
          arrayFilters: [{ "elem.userId": userId }],
          new: true
        }
      )
        .populate("members", "name avatar")
        .populate("lastMessage", "type content createdAt")
        .sort({ updatedAt: -1 });
    } else {
      // Nếu chưa có, thêm mới vào delete_history
      updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $addToSet: {
            delete_history: {
              userId: userId,
              time_delete: time_delete,
            },
          },
        },
        { new: true }
      )
        .populate("members", "name avatar")
        .populate("lastMessage", "type content createdAt")
        .sort({ updatedAt: -1 });
    }

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Cập nhật avatar conversation
const updateAvataConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { avatar } = req.body;

    // Kiểm tra dữ liệu có tồn tại
    if (!avatar) {
      return res.status(400).json({ message: "Thiếu dữ liệu fileBase64" });
    }

    const resourceType = avatar.isImage ? "image" : "raw";
    const result = await cloudinary.uploader.upload(`data:image/png;base64,${avatar.fileUri}`, {
      folder: "zalo/avatar-group-chat",
      resource_type: resourceType,
    });

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { avatar: result.secure_url },
      { new: true }
    )
      .populate("members", "name avatar")
      .populate("lastMessage", "type content createdAt")
      .sort({ updatedAt: -1 });

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
}

// 📌 Thêm thành viên
const addMemberToGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newMembers } = req.body; // newMembers là mảng các userId mới

    // Tìm cuộc trò chuyện
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Kiểm tra xem các thành viên mới đã có trong danh sách members chưa
    const existingMembers = conversation.members.filter(member => newMembers.includes(member.toString()));
    if (existingMembers.length > 0) {
      return res.status(400).json({ error: "Some members already exist in the group" });
    }

    // Cập nhật danh sách thành viên
    conversation.members.push(...newMembers);
    await conversation.save();

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error adding members to group:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Xóa thành viên khỏi group
const removeMemberFromGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { memberId } = req.body; // memberId là id của thành viên cần xóa

    // Tìm cuộc trò chuyện
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Xóa thành viên khỏi danh sách members
    conversation.members = conversation.members.filter(member => member.toString() !== memberId);
    await conversation.save();

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error removing member from group:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Thay đổi admin group
const changeAdminGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newAdminId } = req.body; // newAdminId là id của admin mới

    // Tìm cuộc trò chuyện
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Kiểm tra xem newAdminId có trong danh sách members không
    if (!conversation.members.includes(newAdminId)) {
      return res.status(400).json({ error: "New admin must be a member of the group" });
    }

    // Cập nhật admin
    conversation.admin = newAdminId;
    await conversation.save();

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error changing group admin:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  create1vs1,
  getUserConversations,
  getConversation,
  getConversation1vs1,
  getConversationsGroup,
  createGroup,
  deleteConversation1vs1,
  updateAvataConversation,
  addMemberToGroup,
  removeMemberFromGroup,
  changeAdminGroup
};
