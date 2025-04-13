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

export const signIn = async (email, password, deviceType, deviceId) => {
  try {
    const response = await api.post("/api/auth/signin", {
      email,
      password,
      device_type: deviceType,
      device_id: deviceId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async (userId, deviceType) => {
  try {
    const response = await api.post("/api/auth/logout", {
      userId,
      deviceType,
    });
    return response.data;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error.response?.data || error;
  }
};

export const getUserData = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
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

export const getUserFromMongoDB = async (userId) => {
  try {
    const response = await api.get(`/api/users/mongo/${userId}`);
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