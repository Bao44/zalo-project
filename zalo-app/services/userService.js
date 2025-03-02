import { supabase } from "../lib/supabase";

const getUserFromMongo = async (userId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        return null;
    }
};

// Gọi API
getUserFromMongo("65d4f9e1c0b1a7d3e4b9f1a2").then(user => console.log(user));