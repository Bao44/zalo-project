const authService = require("../services/authService");
const User = require("../models/User");
const deviceService = require("../services/deviceService");

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANOKEY;

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

  async signInWithMobile(req, res) {
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

  async signInWithWeb(req, res) {
    const { email, password, device_id, device_type } = req.body;

    if (!email || !password || !device_id || !device_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Đăng nhập bằng Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const userId = data.user.id;

      // Chỉ xóa thiết bị cũ cùng device_type
      const { error: deleteError } = await supabase
        .from("devices")
        .delete()
        .eq("user_id", userId)
        .eq("device_type", device_type);

      if (deleteError) {
        console.error("Error deleting old device:", deleteError);
      } else {
        console.log(`Deleted old ${device_type} device for user ${userId}`);
      }

      // Thêm thiết bị mới
      const { error: deviceError } = await supabase.from("devices").insert([
        {
          user_id: userId,
          id: device_id,
          device_type: device_type,
          last_sign_in_at: new Date(data.user.last_sign_in_at),
        },
      ]);

      if (deviceError) {
        console.error("Failed to store device info:", deviceError);
        return res.status(500).json({ error: "Failed to store device info" });
      }

      console.log(`Inserted new ${device_type} device: ${device_id}`);

      // Trả về thông tin đăng nhập
      return res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            last_sign_in_at: data.user.last_sign_in_at,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
          },
        },
      });
    } catch (err) {
      console.error("Sign-in error:", err);
      return res
        .status(500)
        .json({ error: "Internal server error", detail: err.message });
    }
  },

  async logOut(req, res) {
    try {
      const { userId, deviceType } = req.body;

      await deviceService.deleteDevice(userId, deviceType);
      return res
        .status(200)
        .json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;
