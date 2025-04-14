import axios from "axios";
import { BACKEND_URL } from '../constants/ip';

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Gửi yêu cầu kết bạn
export const sendFriendRequest = async (senderId, receiverId, content, type) => {
    try {
        const response = await api.post("/api/friendships/send-friend-request", {
            senderId,
            receiverId,
            content,
            type
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

//Lấy danh sách yêu cầu kết bạn
export const getFriendRequests = async (senderId) => {
    try {
        const response = await api.get(`/api/friendships/friend-requests/${senderId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

//Chấp nhận hoặc từ chối yêu cầu kết bạn
export const respondToFriendRequest = async (senderId, receiverId, status) => {
    try {
        const response = await api.post("/api/friendships/respond-friend-request", {
            senderId,
            receiverId,
            status,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

//Lấy danh sách bạn bè
export const getFriends = async (userId) => {
    try {
        const response = await api.get(`/api/friendships/friends/${userId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

//Tìm kiếm bạn bè
export const searchFriends = async (phone) => {
    try {
        const response = await api.get(`/api/friendships/search-friends/${phone}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

//Kiểm tra đã là bạn hay chưa
export const checkFriendship = async (userId, friendId) => {
    try {
        const response = await api.get(`/api/friendships/check-friend/${userId}/${friendId}`);
        return {success: true, data: response.data};
    } catch (error) {
        return handleApiError(error);
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