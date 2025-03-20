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
            files: messageData.files,
            replyTo: messageData.replyTo,
            receiverId: messageData.receiverId
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Send Message Error:", error.response?.data || error);
        throw error;
    }
};
