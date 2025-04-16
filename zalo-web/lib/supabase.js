import { createClient } from "@supabase/supabase-js";
import { supabaseRoleKey, supabaseUrl } from "../../zalo-app/constants";

export const supabase = createClient(supabaseUrl, supabaseRoleKey, {
  auth: {
    autoRefreshToken: true, // Tự động làm mới token
    persistSession: true, // Lưu phiên đăng nhập vào localStorage
    detectSessionInUrl: true, // Dành cho OAuth login
  },
});