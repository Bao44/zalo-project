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

      if (!email || !password || !device_type) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin email, password hoặc device_type",
        });
      }

      // Đăng nhập với Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      if (data?.user) {
        try {
          let mongoUser = await User.findOne({ _id: data.user.id });
          console.log("Mongo User:", mongoUser);
          console.log("Supabase User:", data);
          console.log("Supabase User ID:", data.user.email);
          if (!mongoUser) {
            mongoUser = new User({
              _id: data.user.id,
              email: data.user.email,
              name: data.user.name || "",
              phone: data.user.phone || "",
              avatar: data.user.avatar || "",
              background: data.user.background || "",
              bio: data.user.bio || "",
              dob: data.user.dob || null,
              gender: data.user.gender || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            mongoUser.email = data.user.email || mongoUser.email;
            mongoUser.name = data.user.name || mongoUser.name;
            mongoUser.updatedAt = new Date();
          }

          await mongoUser.save();
        } catch (dbError) {
          console.error("Error syncing to MongoDB:", dbError);
        }
      }

      const { user, session } = data;

      // Kiểm tra xem đã có thiết bị nào cùng device_type chưa
      const { data: existingDevice, error: deviceError } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_type", device_type)
        .single();

      if (deviceError && deviceError.code !== "PGRST116") {
        // PGRST116 là mã lỗi khi không tìm thấy bản ghi (không phải lỗi nghiêm trọng)
        return res.status(500).json({
          success: false,
          message: "Lỗi khi kiểm tra thiết bị: " + deviceError.message,
        });
      }

      if (existingDevice) {
        // Nếu đã có thiết bị, từ chối đăng nhập
        return res.status(403).json({
          success: false,
          message: "Tài khoản đã được đăng nhập trên một thiết bị web khác",
        });
      }

      // Tạo session_token mới
      const session_token = uuidv4();

      // Thêm thiết bị mới
      const { error: insertError } = await supabase.from("devices").insert({
        user_id: user.id,
        device_type,
        session_token,
        last_active: new Date().toISOString(),
      });

      if (insertError) {
        return res.status(500).json({
          success: false,
          message: "Lỗi khi thêm thiết bị: " + insertError.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
          },
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            session_token,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
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
