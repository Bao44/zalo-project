const authService = require("../services/authService");
const User = require("../models/User");

const authController = {
  async signUp(req, res) {
    try {
      const { email, password, name } = req.body;

      // Kiểm tra nếu email đã tồn tại trong MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được đăng ký. Vui lòng sử dụng email khác.",
        });
      }

      // Đăng ký người dùng với Supabase
      const { data, error } = await authService.signUp(email, password, {
        name,
      });

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      // Đồng bộ với MongoDB nếu đăng ký Supabase thành công
      if (data?.user) {
        try {
          // Kiểm tra nếu người dùng đã tồn tại trong MongoDB
          let mongoUser = await User.findOne({ email: data.user.email });

          if (!mongoUser) {
            // Tạo người dùng mới trong MongoDB
            mongoUser = new User({
              supabaseId: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || "",
              created_at: new Date(),
            });
            await mongoUser.save();
          }
        } catch (dbError) {
          console.error("Error syncing to MongoDB:", dbError);
          // Tiếp tục vì đăng ký Supabase đã thành công
        }
      }

      return res.status(201).json({
        success: true,
        data: data,
        message: "User registered successfully! Please verify your email.",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async signIn(req, res) {
    try {
      const { email, password } = req.body;

      // Đăng nhập với Supabase
      const { data, error } = await authService.signInWithPassword(
        email,
        password
      );

      if (error) {
        return res.status(401).json({ success: false, message: error.message });
      }

      // Đồng bộ với MongoDB nếu đăng nhập thành công
      if (data?.user) {
        try {
          // Kiểm tra nếu người dùng đã tồn tại trong MongoDB
          let mongoUser = await User.findOne({ supabaseId: data.user.id });

          if (!mongoUser) {
            // Tạo người dùng mới trong MongoDB nếu chưa tồn tại
            mongoUser = new User({
              supabaseId: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || "",
              created_at: new Date(),
            });
            await mongoUser.save();
          }
        } catch (dbError) {
          console.error("Error syncing to MongoDB:", dbError);
          // Tiếp tục vì đăng nhập Supabase đã thành công
        }
      }
      return res
        .status(200)
        .json({
          success: true,
          data: { user: data.user, session: data.session },
        });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;
