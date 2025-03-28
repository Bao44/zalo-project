import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "../../zalo-app/constants";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Tự động làm mới token
    persistSession: true, // Lưu phiên đăng nhập vào localStorage
    detectSessionInUrl: true, // Dành cho OAuth login
  },
});

supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});
