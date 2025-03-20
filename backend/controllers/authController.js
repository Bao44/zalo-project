const authService = require("../services/authService");
const User = require("../models/User");

const authController = {
  async signUp(req, res) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được đăng ký. Vui lòng sử dụng email khác.",
        });
      }

      const { data, error } = await authService.signUp(email, password, {
        name,
      });

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (data?.user) {
        try {
          let mongoUser = await User.findOne({ _id: data.user.id });

          if (!mongoUser) {
            mongoUser = new User({
              _id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            await mongoUser.save();
          }
        } catch (dbError) {
          console.error("Error syncing to MongoDB:", dbError);
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

      const { data, error } = await authService.signInWithPassword(
        email,
        password
      );

      if (error) {
        return res.status(401).json({ success: false, message: error.message });
      }

      if (data?.user) {
        try {
          let mongoUser = await User.findOne({ _id: data.user.id });

          if (!mongoUser) {
            mongoUser = new User({
              _id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            await mongoUser.save();
          }
        } catch (dbError) {
          console.error("Error syncing to MongoDB:", dbError);
        }
      }

      return res.status(200).json({
        success: true,
        data: { user: data.user, session: data.session },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;