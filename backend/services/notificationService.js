const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const notificationService = {
  async createNotification(notification) {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return { data, error };
  },

  async fetchNotifications(receiverId) {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
          *,
          sender: senderId(id, name, avatar)
        `
      )
      .eq("receiverId", receiverId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error };
  },
};

module.exports = notificationService;
