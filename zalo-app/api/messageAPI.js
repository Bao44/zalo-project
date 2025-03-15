import axios from "axios";

export const getMessages = async (conversationId) => {
    try {
        const res = await axios.get(`http://192.168.1.230:3000/api/messages/get-message/${conversationId}`);
        return res.data;
    }
    catch (error) {
        console.error("Get Messages Error:", error.response?.data || error);
        throw error;
    }
};

export const sendMessage = async (conversationId, messageData) => {
    try {
        const response = await axios.post("http://192.168.1.230:3000/api/messages/send-message", {
            conversationId,
            senderId: messageData.senderId, // Lấy từ AuthContext
            content: messageData.content,
            attachments: messageData.attachments,
            media: messageData.media,
            files: messageData.files,
            replyTo: messageData.replyTo,
            receiverId: messageData.receiverId // Dùng khi tạo conversation mới
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            data: error.response?.data?.error || "Không thể gửi tin nhắn" 
        };
    }
};