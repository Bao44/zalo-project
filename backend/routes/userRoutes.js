const express = require("express");
const User = require("../models/User"); // Model user trong MongoDB
const router = express.Router();

// API lấy thông tin user theo ID
// router.get("/:id", async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) return res.status(404).json({ message: "User không tồn tại" });
//         res.json(user);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;


// ---------------------------------

// Route để đồng bộ dữ liệu người dùng từ Supabase sang MongoDB
router.post('/sync', async (req, res) => {
  try {
    console.log('Received sync request:', JSON.stringify(req.body));
    
    const { supabaseUser } = req.body;

    if (!supabaseUser || !supabaseUser.id) {
      console.error('Invalid user data:', req.body);
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }

    // Lấy dữ liệu từ Supabase user
    const { id, email, user_metadata, created_at } = supabaseUser;
    
    console.log('Processing user data:', {
      id,
      email,
      user_metadata: JSON.stringify(user_metadata),
      created_at
    });

    // Tìm người dùng theo supabaseId, nếu tồn tại thì cập nhật, nếu không thì tạo mới
    const userData = {
      supabaseId: id,
      id: id, // Giữ cả id và supabaseId để tương thích
      email: email || '',
      name: user_metadata?.name || '',
      phone: user_metadata?.phone || '',
      avatar: user_metadata?.avatar || '',
      gender: user_metadata?.sex !== undefined ? parseInt(user_metadata.sex) : null,
      dob: user_metadata?.dob ? new Date(user_metadata.dob) : null,
      address: user_metadata?.address || '',
      background: user_metadata?.background || '',
      bio: user_metadata?.bio || '',
      friends: user_metadata?.friends || [],
      conversations: user_metadata?.conversations || [],
      createdAt: created_at ? new Date(created_at) : new Date(),
      updatedAt: new Date()
    };

    console.log('Prepared user data for MongoDB:', JSON.stringify(userData));

    const user = await User.findOneAndUpdate(
      { supabaseId: id },
      userData,
      { new: true, upsert: true }
    );

    console.log('User synced successfully:', user._id);

    res.json({
      success: true,
      message: 'User synced successfully',
      user
    });
  } catch (error) {
    console.error('Error syncing user to MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing user data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Lấy thông tin người dùng theo supabaseId
router.get('/:supabaseId', async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.params.supabaseId });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy thông tin người dùng theo email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật thông tin người dùng
// router.put('/:supabaseId', async (req, res) => {
//   try {
//     const updatedUser = await User.findOneAndUpdate(
//       { supabaseId: req.params.supabaseId },
//       req.body,
//       { new: true }
//     );
    
//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     res.json({ success: true, user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// Thêm bạn bè
// router.post('/:supabaseId/friends', async (req, res) => {
//   try {
//     const { friendId } = req.body;
    
//     if (!friendId) {
//       return res.status(400).json({ success: false, message: 'Friend ID is required' });
//     }
    
//     const user = await User.findOne({ supabaseId: req.params.supabaseId });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     if (!user.friends.includes(friendId)) {
//       user.friends.push(friendId);
//       await user.save();
//     }
    
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// Thêm cuộc trò chuyện
// router.post('/:supabaseId/conversations', async (req, res) => {
//   try {
//     const { conversationId } = req.body;
    
//     if (!conversationId) {
//       return res.status(400).json({ success: false, message: 'Conversation ID is required' });
//     }
    
//     const user = await User.findOne({ supabaseId: req.params.supabaseId });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     if (!user.conversations.includes(conversationId)) {
//       user.conversations.push(conversationId);
//       await user.save();
//     }
    
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

module.exports = router;