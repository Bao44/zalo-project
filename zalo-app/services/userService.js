import { supabase } from "../lib/supabase";
import axios from 'axios';

const BACKEND_URL = 'http://192.168.2.30:3000'; // Chú ý dấu hai chấm trước cổng // Thay đổi IP nếu chạy trên thiết bị thực

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error.message };
    }
    
    // Đồng bộ dữ liệu sang MongoDB sau khi lấy thành công
    if (data) {
      try {
        await syncUserToMongoDB({
          id: userId,
          email: data.email,
          user_metadata: data
        });
      } catch (syncError) {
        console.error("Error syncing data to MongoDB:", syncError);
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.log("got error", error);
    return { success: false, msg: error.message };
  }
};

export const updateUser = async (userId, data) => {
  try {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId);

    if (error) {
      return { success: false, msg: error.message };
    }
    
    // Đồng bộ dữ liệu đã cập nhật sang MongoDB
    try {
      // Lấy dữ liệu mới nhất sau khi cập nhật
      const { data: updatedData } = await supabase
        .from("users")
        .select()
        .eq("id", userId)
        .single();
        
      if (updatedData) {
        await syncUserToMongoDB({
          id: userId,
          email: updatedData.email,
          user_metadata: updatedData
        });
      }
    } catch (syncError) {
      console.error("Error syncing updated data to MongoDB:", syncError);
    }
    
    return { success: true, data };
  } catch (error) {
    console.log("got error", error);
    return { success: false, msg: error.message };
  }
};

// Đồng bộ dữ liệu người dùng từ Supabase sang MongoDB
export const syncUserToMongoDB = async (user) => {
  try {
    console.log('Sending data to MongoDB:', JSON.stringify(user));
    const response = await axios.post(`${BACKEND_URL}/api/users/sync`, {
      supabaseUser: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.user_metadata.created_at || new Date().toISOString()
      }
    });
    
    console.log('User synced to MongoDB:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error syncing user to MongoDB:', error.message);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Lấy thông tin người dùng từ MongoDB
export const getUserFromMongoDB = async (supabaseId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/users/${supabaseId}`);
    return response.data.user;
  } catch (error) {
    console.error('Error getting user from MongoDB:', error.message);
    throw error;
  }
};

// Lấy thông tin người dùng theo email từ MongoDB
export const getUserByEmailFromMongoDB = async (email) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/users/email/${email}`);
    return response.data.user;
  } catch (error) {
    console.error('Error getting user by email from MongoDB:', error.message);
    throw error;
  }
};

// Cập nhật bạn bè trong MongoDB
export const addFriendInMongoDB = async (supabaseId, friendId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/${supabaseId}/friends`, {
      friendId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding friend in MongoDB:', error.message);
    throw error;
  }
};

// Thêm cuộc trò chuyện trong MongoDB
export const addConversationInMongoDB = async (supabaseId, conversationId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/${supabaseId}/conversations`, {
      conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding conversation in MongoDB:', error.message);
    throw error;
  }
};