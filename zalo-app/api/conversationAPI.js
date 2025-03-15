// Description: Conversation API
import axios from "axios";

const BACKEND_URL = "http://192.168.0.127:3000";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tạo cuộc trò chuyện
export const getConversations = async (userId) => {
  try {
    const res = await api.get(BACKEND_URL + `/api/conversations/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get Conversations Error:", error.response?.data || error);
    throw error;
  }
};

// Lấy cuộc trò chuyện
export const getConversation = async (conversationId) => {
  try {
    const res = await api.get(BACKEND_URL + `/api/conversations/conversationId/${conversationId}`);
    return res.data;
  }
  catch (error) {
    console.error("Get Conversation Error:", error.response?.data || error);
    throw error;
  }
};

// Lấy cuôc trò chuyện giữa 2 người
export const getConversationBetweenTwoUsers = async (friend_id, user_id) => {
  try {
    const res = await api.get(BACKEND_URL + `/api/conversations/${friend_id}/${user_id}`);
    return res.data;
  } catch (error) {
    console.error("Get Conversation Between Two Users Error:", error.response?.data || error);
    throw error;
  }
};
