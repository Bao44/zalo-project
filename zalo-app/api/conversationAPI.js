// Description: Conversation API
import axios from "axios";
import { BACKEND_URL } from '../constants/ip';


const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy tất cả cuộc trò chuyện của người dùng
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
    const res = await api.get(BACKEND_URL + `/api/conversations/get-conversation1vs1/${friend_id}/${user_id}`);
    return { success: true, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

// Tạo cuộc trò chuyện 1-1
export const createConversation1vs1 = async (userId, friendId) => {
  try {
    if (!userId || !friendId) {
      return { success: false, data: { message: "userId và friendId là bắt buộc" } };
    }

    const response = await axios.post(BACKEND_URL + `/api/conversations/create1vs1`, {
      user1: userId,
      user2: friendId
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in createConversation1vs1:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
};

// Xư lý lỗi trả về từ API
const handleApiError = (error) => {
  if (error.response) {
    return {
      success: false,
      msg:
        error.response.data.message ||
        error.response.data.msg ||
        "An error occurred while processing the request",
      details: error.response.data,
    };
  } else if (error.request) {
    return {
      success: false,
      msg: "No response received from server",
    };
  } else {
    return {
      success: false,
      msg: error.message,
    };
  }
};