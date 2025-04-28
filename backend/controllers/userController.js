const authService = require("../services/authService");
const User = require("../models/User");
const { getSocketInstance } = require("../socket");

const userController = {
  async getUserData(req, res) {
    try {
      const { userId } = req.params;

      const { data, error } = await authService.getUserData(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (data) {
        try {
          let mongoUser = await User.findOne({ _id: userId });

          if (!mongoUser) {
            mongoUser = new User({
              _id: userId,
              email: data.email,
              name: data.name || "",
              phone: data.phone || "",
              avatar: data.avatar || "",
              background: data.background || "",
              bio: data.bio || "",
              dob: data.dob || null,
              gender: data.gender || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            mongoUser.email = data.email || mongoUser.email;
            mongoUser.name = data.name || mongoUser.name;
            mongoUser.updatedAt = new Date();
          }

          await mongoUser.save();
        } catch (dbError) {
          console.error("Error syncing to MongoDB:", dbError);
        }
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const userData = req.body;

      const { data, error } = await authService.updateUser(userId, userData);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (data) {
        try {
          let mongoUser = await User.findOne({ _id: userId });

          if (mongoUser) {
            // Only update fields that exist in the schema
            const allowedFields = [
              "name",
              "phone",
              "avatar",
              "background",
              "gender",
              "dob",
              "email",
              "bio",
            ];
            Object.keys(userData).forEach((key) => {
              if (allowedFields.includes(key)) {
                mongoUser[key] = userData[key];
              }
            });
            mongoUser.updatedAt = new Date();

            await mongoUser.save();
          }
        } catch (dbError) {
          console.error("Error syncing updated data to MongoDB:", dbError);
        }
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async syncUserToMongoDB(req, res) {
    try {
      const { supabaseUser } = req.body;

      if (!supabaseUser || !supabaseUser.id) {
        return res.status(400).json({
          success: false,
          message: "Invalid user data provided",
        });
      }

      let user = await User.findOne({ _id: supabaseUser.id });

      if (!user) {
        user = new User({
          _id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        user.email = supabaseUser.email || user.email;
        user.name = supabaseUser.user_metadata?.name || user.name;
        user.updatedAt = new Date();
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User synced successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserFromMongoDB(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserByEmailFromMongoDB(req, res) {
    try {
      const { email } = req.params;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async addFriend(req, res) {
    try {
      const { userId } = req.params;
      const { friendId } = req.body;

      if (!userId || !friendId) {
        return res.status(400).json({
          success: false,
          message: "Missing user ID or friend ID",
        });
      }

      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const friend = await User.findOne({ _id: friendId });

      if (!friend) {
        return res.status(404).json({
          success: false,
          message: "Friend not found",
        });
      }

      if (user.friends.includes(friendId)) {
        return res.status(400).json({
          success: false,
          message: "Already friends",
        });
      }

      user.friends.push(friendId);
      user.updatedAt = new Date();
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Friend added successfully",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async addConversation(req, res) {
    try {
      const { userId } = req.params;
      const { conversationId } = req.body;

      if (!userId || !conversationId) {
        return res.status(400).json({
          success: false,
          message: "Missing user ID or conversation ID",
        });
      }

      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.conversations.includes(conversationId)) {
        return res.status(400).json({
          success: false,
          message: "Conversation already exists",
        });
      }

      user.conversations.push(conversationId);
      user.updatedAt = new Date();
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Conversation added successfully",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Check user online status
  async checkUserOnline(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Missing user ID",
        });
      }

      const io = getSocketInstance();
      console.log("io", Array.from(io.onlineUsers.keys()));
      const isOnline = io.onlineUsers.has(userId);

      return res.status(200).json({
        success: true,
        isOnline,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = userController;
