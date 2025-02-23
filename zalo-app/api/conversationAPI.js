import { axiosConfig } from "../utils/axiosConfig";
import axios from "axios";

export const getConversations = async (userId) => {
  try {
    const res = await axios.get(`http://192.168.1.230:3000/api/conversations/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get Conversations Error:", error.response?.data || error);
    throw error;
  }
};