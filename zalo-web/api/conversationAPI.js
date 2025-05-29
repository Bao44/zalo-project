// Description: Conversation API
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy tất cả cuộc trò chuyện của người dùng
export const getConversations = async (userId) => {
  try {
    const res = await api.get(BACKEND_URL + `/api/conversations/${userId}`);
    return { success: true, data: res.data }
  } catch (error) {
    console.error("Get Conversations Error:", error.response?.data || error);
    throw error;
  }
};

//Lấy tất cả các cuộc trò chuyện nhóm
export const getConversationsGroup = async (userId) => {
  try {
    const res = await api.get(BACKEND_URL + `/api/conversations/group/${userId}`);
    return { success: true, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
}

// Lấy cuộc trò chuyện
export const getConversation = async (conversationId) => {
  try {
    const res = await api.get(BACKEND_URL + `/api/conversations/conversationId/${conversationId}`);
    return { success: true, data: res.data };
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

    const response = await api.post(BACKEND_URL + `/api/conversations/create1vs1`, {
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

//Tạo group chat
export const createConversationGroupChat = async (groupData) => {
  try {
    if (!groupData.admin || groupData.members.length < 2) {
      return { success: false, data: { message: "Có thể chưa đủ số lượng thành viên tối thiểu!" } };
    }

    const response = await api.post(BACKEND_URL + "/api/conversations/createGroup", {
      admin: groupData.admin,
      avatar: groupData.avatar,
      nameGroup: groupData.nameGroup,
      members: groupData.members
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in createConversationGroup:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
}

// Xóa lịch sử trò chuyện của người dùng
export const deleteConversation1vs1 = async (conversationId, userId) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${conversationId}/delete/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in deleteConversation1vs1:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
};

// Thay đổi admin group
export const changeAdminGroup = async (conversationId, newAdminId) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${conversationId}/change-admin`, { newAdminId });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in changeAdminGroup:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
};

// Cập nhật avatar cuộc trò chuyện
export const updateAvataConversation = async (conversationId, avatar) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${conversationId}/avatar`, { avatar });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateAvataConversation:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
};

// Thêm thành viên vào group
export const addMemberToGroup = async (conversationId, newMembers, userRequest) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${conversationId}/add-member`, { newMembers, userRequest });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in addMemberToGroup:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
};

// Xóa thành viên khỏi group
export const removeMemberFromGroup = async (conversationId, memberId, userRequest) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${conversationId}/remove-member`, { memberId, userRequest });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in removeMemberFromGroup:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
};

// Thay đổi cài đặt approved
export const changeSettingApproved = async (converId) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${converId}/change-approved`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in changeSettingApproved:", error);
    const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định từ server";
    return { success: false, data: { message: errorMessage } };
  }
}

// Xử lý duyệt or xóa yêu cầu tham gia nhóm
export const handleApprovedRequest = async (conversationId, memberId, userRequest, action) => {
  try {
    const response = await api.patch(BACKEND_URL + `/api/conversations/${conversationId}/handle-request`, { memberId, userRequest, action });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in handleApprovedRequest:", error);
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