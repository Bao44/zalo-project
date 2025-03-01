// Description: Conversation API
import axios from "axios";

export const getConversations = async (userId) => {
  try {
    const res = await axios.get(`http://192.168.43.77:3000/api/conversations/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get Conversations Error:", error.response?.data || error);
    throw error;
  }
};

export const getConversation = async (conversationId) => {
  try {
    const res = await axios.get(`http://192.168.43.77:3000/api/conversations/conversationId/${conversationId}`);
    return res.data;
  }
  catch (error) {
    console.error("Get Conversation Error:", error.response?.data || error);
    throw error;
  }
};