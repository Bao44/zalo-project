import { axiosAuth } from "../utils/axiosConfig";

const getAllMessageForConversation = async (conversationId) => {
  try {
    const { data } = await axiosAuth.get(
      `/api/v1/messages?conversation=${conversationId}`
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const getLatestMessageForConversation = async (conversationId) => {
  try {
    const { data } = await axiosAuth.get(
      `/api/v1/messages/latest?conversation=${conversationId}`
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const createMessage = async (message) => {
  try {
    const { data } = await axiosAuth.post("/api/v1/messages", message);

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const revokeMessage = async (messageId) => {
  try {
    const { data } = await axiosAuth.put(`/api/v1/messages/${messageId}`, {});

    return data;
  } catch (error) {
    console.log(error);
  }
};

const MessageAPI = {
  getAllMessageForConversation,
  getLatestMessageForConversation,
  createMessage,
  revokeMessage,
};
export default MessageAPI;
