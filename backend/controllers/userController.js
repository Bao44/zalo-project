const authService = require('../services/authService');
const User = require('../models/User'); 

const userController = {
  async getUserData(req, res) {
    try {
      const { userId } = req.params;
      
      // Lấy dữ liệu từ Supabase
      const { data, error } = await authService.getUserData(userId);
      
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      // Đồng bộ với MongoDB
      if (data) {
        try {
          let mongoUser = await User.findOne({ supabaseId: userId });
          
          if (!mongoUser) {
            mongoUser = new User({
              supabaseId: userId,
              email: data.email,
              name: data.name || '',
              created_at: data.created_at || new Date()
            });
          } else {
            // Cập nhật thông tin nếu cần
            mongoUser.email = data.email || mongoUser.email;
            mongoUser.name = data.name || mongoUser.name;
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
      
      // Cập nhật trong Supabase
      const { data, error } = await authService.updateUser(userId, userData);
      authService
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      // Đồng bộ với MongoDB
      if (data) {
        try {
          let mongoUser = await User.findOne({ supabaseId: userId });
          
          if (mongoUser) {
            // Cập nhật thông tin MongoDB
            Object.keys(userData).forEach(key => {
              mongoUser[key] = userData[key];
            });
            
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
  
  // Phương thức đồng bộ dữ liệu người dùng từ Supabase sang MongoDB
  async syncUserToMongoDB(req, res) {
    try {
      const { supabaseUser } = req.body;
      
      if (!supabaseUser || !supabaseUser.id) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user data provided" 
        });
      }
      
      // Kiểm tra nếu người dùng đã tồn tại
      let user = await User.findOne({ supabaseId: supabaseUser.id });
      
      if (!user) {
        // Tạo người dùng mới
        user = new User({
          supabaseId: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || '',
          created_at: supabaseUser.created_at || new Date()
        });
      } else {
        // Cập nhật thông tin nếu cần
        user.email = supabaseUser.email || user.email;
        if (supabaseUser.user_metadata) {
          user.name = supabaseUser.user_metadata.name || user.name;
        }
      }
      
      await user.save();
      
      return res.status(200).json({ 
        success: true, 
        message: "User synced successfully",
        user
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Lấy thông tin người dùng từ MongoDB theo supabaseId
  async getUserFromMongoDB(req, res) {
    try {
      const { supabaseId } = req.params;
      
      const user = await User.findOne({ supabaseId });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Lấy thông tin người dùng từ MongoDB theo email
  async getUserByEmailFromMongoDB(req, res) {
    try {
      const { email } = req.params;
      
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Thêm bạn bè trong MongoDB
  async addFriend(req, res) {
    try {
      const { supabaseId } = req.params;
      const { friendId } = req.body;
      
      if (!supabaseId || !friendId) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing user ID or friend ID" 
        });
      }
      
      const user = await User.findOne({ supabaseId });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      // Kiểm tra xem friendId có tồn tại không
      const friend = await User.findOne({ supabaseId: friendId });
      
      if (!friend) {
        return res.status(404).json({ 
          success: false, 
          message: "Friend not found" 
        });
      }
      
      // Kiểm tra xem đã là bạn bè chưa
      if (user.friends.includes(friendId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Already friends" 
        });
      }
      
      // Thêm vào danh sách bạn bè
      user.friends.push(friendId);
      await user.save();
      
      return res.status(200).json({ 
        success: true, 
        message: "Friend added successfully" 
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Thêm cuộc trò chuyện trong MongoDB
  async addConversation(req, res) {
    try {
      const { supabaseId } = req.params;
      const { conversationId } = req.body;
      
      if (!supabaseId || !conversationId) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing user ID or conversation ID" 
        });
      }
      
      const user = await User.findOne({ supabaseId });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      // Kiểm tra xem đã có cuộc trò chuyện này chưa
      if (user.conversations.includes(conversationId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Conversation already exists" 
        });
      }
      
      // Thêm vào danh sách cuộc trò chuyện
      user.conversations.push(conversationId);
      await user.save();
      
      return res.status(200).json({ 
        success: true, 
        message: "Conversation added successfully" 
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
    
module.exports = userController;