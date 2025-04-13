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
      .maybeSingle();

    console.log("getDeviceByUserAndType:", { data, error });
    return { data, error };
  },

  async createDevice(userId, deviceId, deviceType, lastSignInAt, refreshToken) {
    const { data, error } = await supabase.from("devices").insert([
      {
        user_id: userId,
        id: deviceId,
        device_type: deviceType,
        last_sign_in_at: lastSignInAt || new Date(),
        refresh_token: refreshToken,
      },
    ]);

    console.log("createDevice:", { data, error });
    return { data, error };
  },

  async deleteDevice(userId, deviceType) {
    const { error } = await supabase
      .from("devices")
      .delete()
      .eq("user_id", userId)
      .eq("device_type", deviceType);

    console.log("deleteDevice:", { error });
    return { success: !error, error };
  },
};

module.exports = deviceService;