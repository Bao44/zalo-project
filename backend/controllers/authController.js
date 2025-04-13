const authService = require("../services/authService");
const User = require("../models/User");

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

  // async signIn(req, res) {
  //   const { email, password, device_id, device_type } = req.body;

  //   if (!email || !password || !device_id || !device_type) {
  //     return res.status(400).json({ error: "Missing required fields" });
  //   }

  //   try {
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error || !data.user || !data.session) {
  //       console.log("Supabase auth error:", error);
  //       return res
  //         .status(401)
  //         .json({ error: error?.message || "Invalid email or password" });
  //     }

  //     const userId = data.user.id;

  //     // Lấy danh sách thiết bị
  //     const { data: userDevices, error: devicesError } = await supabase
  //       .from("devices")
  //       .select("*")
  //       .eq("user_id", userId);

  //     if (devicesError) {
  //       console.error("Error fetching user devices:", devicesError);
  //       return res.status(500).json({ error: "Failed to fetch user devices" });
  //     }

  //     // Kiểm tra xem đã có thiết bị cùng loại hay chưa
  //     const hasWebDevice = userDevices.some(
  //       (device) => device.device_type === "web"
  //     );
  //     const hasMobileDevice = userDevices.some(
  //       (device) => device.device_type === "mobile"
  //     );

  //     // Nếu đã có thiết bị cùng loại, xóa thiết bị cũ trước khi thêm mới
  //     if (device_type === "mobile" && hasMobileDevice) {
  //       const { error: deleteError } = await supabase
  //         .from("devices")
  //         .delete()
  //         .eq("user_id", userId)
  //         .eq("device_type", "mobile");

  //       if (deleteError) {
  //         console.error("Failed to delete old mobile device:", deleteError);
  //         return res.status(500).json({ error: "Failed to replace device" });
  //       }
  //     } else if (device_type === "web" && hasWebDevice) {
  //       const { error: deleteError } = await supabase
  //         .from("devices")
  //         .delete()
  //         .eq("user_id", userId)
  //         .eq("device_type", "web");

  //       if (deleteError) {
  //         console.error("Failed to delete old web device:", deleteError);
  //         return res.status(500).json({ error: "Failed to replace device" });
  //       }
  //     }

  //     const lastSignInAt = new Date(data.user.last_sign_in_at).toISOString();
  //     const { error: insertError } = await supabase.from("devices").insert([
  //       {
  //         user_id: userId,
  //         id: device_id,
  //         device_type: device_type,
  //         last_sign_in_at: lastSignInAt,
  //         refresh_token: data.session.refresh_token,
  //       },
  //     ]);

  //     if (insertError) {
  //       console.error("Failed to store device info:", insertError);
  //       return res.status(500).json({ error: "Failed to store device info" });
  //     }

  //     console.log(`Inserted new ${device_type} device: ${device_id}`);

  //     const response = {
  //       message: "Login successful",
  //       data: {
  //         user: {
  //           id: data.user.id,
  //           email: data.user.email,
  //           last_sign_in_at: lastSignInAt,
  //         },
  //         session: {
  //           access_token: data.session.access_token,
  //           refresh_token: data.session.refresh_token,
  //           expires_in: data.session.expires_in,
  //         },
  //         device_replaced: hasMobileDevice || hasWebDevice, // Báo rằng thiết bị cũ đã bị thay thế
  //       },
  //     };
  //     console.log("SignIn response:", response);
  //     return res.status(200).json(response);
  //   } catch (err) {
  //     console.error("Sign-in error:", err);
  //     return res
  //       .status(500)
  //       .json({ error: "Internal server error", detail: err.message });
  //   }
  // },

  async signIn(req, res) {
    const { email, password, device_id, device_type } = req.body;
  
    if (!email || !password || !device_id || !device_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error || !data.user || !data.session) {
        console.log("Supabase auth error:", error);
        return res
          .status(401)
          .json({ error: error?.message || "Invalid email or password" });
      }
  
      const userId = data.user.id;
  
      // Lấy danh sách thiết bị
      const { data: userDevices, error: devicesError } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", userId);
  
      if (devicesError) {
        console.error("Error fetching user devices:", devicesError);
        return res.status(500).json({ error: "Failed to fetch user devices" });
      }
  
      // Kiểm tra xem đã có thiết bị cùng loại hay chưa
      const hasWebDevice = userDevices.some(
        (device) => device.device_type === "web"
      );
      const hasMobileDevice = userDevices.some(
        (device) => device.device_type === "mobile"
      );
  
      // Biến để xác định xem thiết bị cùng loại có bị xóa hay không
      let deviceReplaced = false;
  
      // Nếu đã có thiết bị cùng loại, xóa thiết bị cũ trước khi thêm mới
      if (device_type === "mobile" && hasMobileDevice) {
        const oldMobileDevices = userDevices.filter(
          (device) => device.device_type === "mobile"
        );
  
        // Xóa thiết bị mobile cũ
        const { error: deleteError } = await supabase
          .from("devices")
          .delete()
          .eq("user_id", userId)
          .eq("device_type", "mobile");
  
        if (deleteError) {
          console.error("Failed to delete old mobile device:", deleteError);
          return res.status(500).json({ error: "Failed to replace device" });
        }
  
        deviceReplaced = true;
  
        // Đăng xuất thiết bị mobile cũ (tùy chọn, nếu Supabase hỗ trợ API đăng xuất)
        for (const device of oldMobileDevices) {
          try {
            await supabase.auth.signOut({ scope: "global" }); // Cần tìm cách đăng xuất dựa trên refresh_token hoặc session
            console.log(`Logged out old mobile device: ${device.id}`);
          } catch (err) {
            console.error(`Failed to log out old mobile device ${device.id}:`, err);
          }
        }
      } else if (device_type === "web" && hasWebDevice) {
        const oldWebDevices = userDevices.filter(
          (device) => device.device_type === "web"
        );
  
        // Xóa thiết bị web cũ
        const { error: deleteError } = await supabase
          .from("devices")
          .delete()
          .eq("user_id", userId)
          .eq("device_type", "web");
  
        if (deleteError) {
          console.error("Failed to delete old web device:", deleteError);
          return res.status(500).json({ error: "Failed to replace device" });
        }
  
        deviceReplaced = true;
  
        // Đăng xuất thiết bị web cũ (tùy chọn, nếu Supabase hỗ trợ API đăng xuất)
        for (const device of oldWebDevices) {
          try {
            await supabase.auth.signOut({ scope: "global" }); // Cần tìm cách đăng xuất dựa trên refresh_token hoặc session
            console.log(`Logged out old web device: ${device.id}`);
          } catch (err) {
            console.error(`Failed to log out old web device ${device.id}:`, err);
          }
        }
      }
  
      const lastSignInAt = new Date(data.user.last_sign_in_at).toISOString();
      const { error: insertError } = await supabase.from("devices").insert([
        {
          user_id: userId,
          id: device_id,
          device_type: device_type,
          last_sign_in_at: lastSignInAt,
          refresh_token: data.session.refresh_token,
        },
      ]);
  
      if (insertError) {
        console.error("Failed to store device info:", insertError);
        return res.status(500).json({ error: "Failed to store device info" });
      }
  
      console.log(`Inserted new ${device_type} device: ${device_id}`);
  
      const response = {
        message: "Login successful",
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            last_sign_in_at: lastSignInAt,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
          },
          device_replaced: deviceReplaced, // Chỉ báo cáo nếu thiết bị cùng loại bị xóa
        },
      };
      console.log("SignIn response:", response);
      return res.status(200).json(response);
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

      if (!userId || !deviceType) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu userId hoặc deviceType" });
      }

      // Kiểm tra xem thiết bị có tồn tại không
      const { data: device, error: deviceError } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", userId)
        .eq("device_type", deviceType)
        .single();

      if (deviceError || !device) {
        console.warn(
          `Không tìm thấy thiết bị ${deviceType} cho user ${userId}:`,
          deviceError?.message
        );
        return res.status(200).json({
          success: true,
          message:
            "Không tìm thấy thiết bị để đăng xuất, nhưng quá trình hoàn tất.",
        });
      }

      // Xóa thiết bị khỏi bảng devices
      const { error: deleteError } = await supabase
        .from("devices")
        .delete()
        .eq("user_id", userId)
        .eq("device_type", deviceType);

      if (deleteError) {
        console.error("Không thể xóa thiết bị:", deleteError);
        return res
          .status(500)
          .json({ success: false, message: "Không thể xóa thiết bị" });
      }

      console.log(`Đã xóa thiết bị ${deviceType} của user ${userId}`);
      return res
        .status(200)
        .json({ success: true, message: "Đăng xuất thành công" });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;
