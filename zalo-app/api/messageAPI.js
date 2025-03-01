import axios from "axios";

export const getMessages = async (conversationId) => {
    try {
        const res = await axios.get(`http://192.168.43.77:3000/api/messages/${conversationId}`);
        return res.data;
    }
    catch (error) {
        console.error("Get Messages Error:", error.response?.data || error);
        throw error;
    }
};