const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANOKEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const authService = {

  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return { data, error };
  },

  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error };
  },

  async getUserData(userId) {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { data, error };
  },

  async updateUser(userId, userData) {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId);

    if (error) throw error;
    
    const { data: updatedData, error: fetchError } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    return { data: updatedData, error: null };
  }
};

module.exports = authService;