import { axiosAuth } from "../utils/axiosConfig";

const getAllConversationForUser = async () => {
  try {
    const { data } = await axiosAuth.get("/api/v1/conversations");

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const getConversationById = async (conversationId) => {
  try {
    const { data } = await axiosAuth.get(
      `/api/v1/conversations/${conversationId}`
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const getConversationByUserAndMe = async (userId) => {
  try {
    const { data } = await axiosAuth.get(
      `/api/v1/conversations/same?userId=${userId}`
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const createConversation = async (conversation) => {
  try {
    const { data } = await axiosAuth.post(
      "/api/v1/conversations",
      conversation
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const removeUserForConversation = async (userId, conversationId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/conversations/${conversationId}/remove-user`,
      {
        userId,
      }
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

const addUserForConversation = async (userId, conversationId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/conversations/${conversationId}/add-user`,
      {
        userId,
      }
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const removeYourselfForConversation = async (conversationId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/conversations/${conversationId}/remove-yourself`,
      {}
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

const assignAdminForConversation = async (userId, conversationId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/conversations/${conversationId}/assign-admin`,
      {
        userId,
      }
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

const deleteConversation = async (conversationId) => {
  try {
    const { data } = await axiosAuth.delete(
      `/api/v1/conversations/${conversationId}`
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

const ConversationAPI = {
  getAllConversationForUser,
  getConversationById,
  getConversationByUserAndMe,
  createConversation,
  removeUserForConversation,
  addUserForConversation,
  removeYourselfForConversation,
  assignAdminForConversation,
  deleteConversation,
};

export default ConversationAPI;
