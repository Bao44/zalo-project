const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const deviceService = {
  async getDeviceByUserAndType(userId, deviceType) {
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("user_id", userId)
      .eq("device_type", deviceType)
      .single(); // chỉ lấy 1 nếu tồn tại

    return { data, error };
  },

  async createDevice(userId, deviceType, refreshToken) {
    const { data, error } = await supabase.from("devices").insert([
      {
        user_id: userId,
        device_type: deviceType,
        refresh_token: refreshToken,
        last_sign_in_at: new Date(),
      },
    ]);

    return { data, error };
  },

  async deleteDevice(userId, deviceType) {
    const { error } = await supabase
      .from("devices")
      .delete()
      .eq("user_id", userId)
      .eq("device_type", deviceType);

    return { success: !error, error };
  },
};

module.exports = deviceService;
