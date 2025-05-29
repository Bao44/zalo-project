import { createClient } from "@supabase/supabase-js";

const supabaseRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;

export const supabase = createClient(supabaseUrl, supabaseRoleKey, {
  auth: {
    autoRefreshToken: true, // Tự động làm mới token
    persistSession: true, // Lưu phiên đăng nhập vào localStorage
    detectSessionInUrl: true, // Dành cho OAuth login
  },
});
