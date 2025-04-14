const authService = require("../services/authService");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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

  async signInWithDevice(req, res) {
    try {
      const { email, password, device_type } = req.body;

      // Validate device_type
      if (!["web", "mobile"].includes(device_type)) {
        return res.status(400).json({
          success: false,
          message: "device_type must be either 'web' or 'mobile'",
        });
      }

      // Đăng nhập với Supabase
      const { data, error } = await authService.signInWithPassword(
        email,
        password
      );

      if (error) {
        return res.status(401).json({ success: false, message: error.message });
      }

      const userId = data.user.id;

      // Kiểm tra thiết bị trong bảng devices
      const { data: existingDevice, error: deviceError } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", userId)
        .eq("device_type", device_type);

      if (deviceError) {
        return res.status(500).json({
          success: false,
          message: "Error checking device: " + deviceError.message,
        });
      }

      if (existingDevice.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Tài khoản đã đăng nhập trên một thiết bị ${device_type} khác. Vui lòng đăng xuất trước.`,
        });
      }

      // Tạo session_token và lưu thiết bị vào bảng devices
      const sessionToken = uuidv4();
      const { error: insertError } = await supabase.from("devices").insert([
        {
          user_id: userId,
          device_type,
          session_token: sessionToken,
          last_active: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        return res.status(500).json({
          success: false,
          message: "Error saving device: " + insertError.message,
        });
      }

      // Đồng bộ với MongoDB
      if (data?.user) {
        try {
          let mongoUser = await User.findOne({ _id: userId });

          if (!mongoUser) {
            mongoUser = new User({
              _id: userId,
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
        data: {
          user: data.user,
          session: { ...data.session, session_token: sessionToken },
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async signOut(req, res) {
    try {
      const { user_id, device_type, session_token } = req.body;

      if (!user_id || !device_type || !session_token) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin user_id, device_type hoặc session_token",
        });
      }

      const { data: device, error: deviceError } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user_id)
        .eq("device_type", device_type)
        .eq("session_token", session_token)
        .single();

      if (deviceError || !device) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thiết bị",
        });
      }

      const { error: deleteError } = await supabase
        .from("devices")
        .delete()
        .eq("id", device.id);

      if (deleteError) {
        return res.status(500).json({
          success: false,
          message: "Lỗi khi xóa thiết bị",
        });
      }

      // Không gọi Supabase đăng xuất ở đây, để client-side xử lý
      return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  },
};

module.exports = authController;
