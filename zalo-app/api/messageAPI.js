import axios from "axios";
import { BACKEND_URL } from '../constants/ip';

export const getMessages = async (conversationId) => {
    try {
        const res = await axios.get(BACKEND_URL + `/api/messages/get-messages/${conversationId}`);
        return { success: true, data: res.data };
    }
    catch (error) {
        console.error("Get Messages Error:", error.response?.data || error);
        throw error;
    }
};

export const sendMessage = async (conversationId, messageData) => {
    try {
        const response = await axios.post(BACKEND_URL + "/api/messages/send-message", {
            idTemp: messageData.idTemp,
            conversationId,
            senderId: messageData.senderId,
            content: messageData.content,
            attachments: messageData.attachments,
            media: messageData.media,
            file: messageData.file,
            replyTo: messageData.replyTo,
            receiverId: messageData.receiverId,
            type: messageData.type,
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Send Message Error:", error.response?.data || error);
        throw error;
    }
};

export const addUserSeen = async (conversationId, userId) => {
    try {
        const response = await axios.post(BACKEND_URL + "/api/messages/add-user-seen", { conversationId, userId });
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response?.status === 404) {
            console.log("Người dùng vào xem lại tin nhắn nên không cần cập nhật lại tin nhắn vì đã xem rồi");
        } else {
            // Các lỗi khác thì log chi tiết để debug
            console.error("Lỗi khi gọi API addUserSeen:", error.response?.data || error.message);
        }
    }
};

export const countUnreadMessages = async (conversationId, userId) => {
    try {
        const response = await axios.get(BACKEND_URL + "/api/messages/count-unread-messages", { params: { conversationId, userId } });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Count Unread Messages Error:", error.response?.data || error);
        throw error;
    }
}

export const deleteMessage = async (messageId, userId) => {
    try {
        const response = await axios.post(BACKEND_URL + `/api/messages/delete-message/${messageId}/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Message Error:", error.response?.data || error);
        throw error;
    }
};

export const undoDeleteMessage = async (messageId, userId) => {
    try {
        const response = await axios.post(BACKEND_URL + `/api/messages/undo-message/${messageId}/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Undo Delete Message Error:", error.response?.data || error);
        throw error;
    }
};

export const findPreviousMessage = async (conversationId, messageId, user) => {
    try {
        const response = await axios.get(BACKEND_URL + `/api/messages/search-messagePrevious/${conversationId}/${messageId}`, {user});
        return response.data;
    } catch (error) {
        console.error("Find Previous Message Error:", error.response?.data || error);
        throw error;
    }
};

export const likeMessage = async (messageId, likeStatus, userId) => {
    try {
        const response = await axios.post(BACKEND_URL + `/api/messages/like-or-dislike-message`, {messageId, likeStatus, userId });
        return response.data;
    } catch (error) {
        console.error("Like Message Error:", error.response?.data || error);
        throw error;
    }
};
