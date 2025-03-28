import axios from 'axios';
import { BACKEND_URL } from '../constants/ip';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signUp = async (email, password, name) => {
  try {
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await api.post('/api/auth/signin', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// export const getUserData = async (userId) => {
//   try {
//     const response = await api.get(`/api/users/${userId}`);
//     return { success: true, data: response.data }; // Đảm bảo trả về định dạng { success, data }
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return { success: false, error: error.response?.data || error };
//   }
// };

export const getUserData = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    // Kiểm tra định dạng của response.data
    if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        return { success: false, error: "User not found" };
      }
      return { success: true, data: response.data[0] }; // Lấy phần tử đầu tiên nếu là mảng
    }
    return { success: false, error: "Invalid response format" };
  } catch (error) {
    console.error("Error fetching user data:", error);
    if (error.response?.status === 404) {
      return { success: false, error: "User not found" };
    }
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/api/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserFromMongoDB = async (supabaseId) => {
  try {
    const response = await api.get(`/api/users/mongo/${supabaseId}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserByEmailFromMongoDB = async (email) => {
  try {
    const response = await api.get(`/api/users/email/${email}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addFriendInMongoDB = async (supabaseId, friendId) => {
  try {
    const response = await api.post(`/api/users/${supabaseId}/friends`, {
      friendId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addConversationInMongoDB = async (supabaseId, conversationId) => {
  try {
    const response = await api.post(`/api/users/${supabaseId}/conversations`, {
      conversationId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};