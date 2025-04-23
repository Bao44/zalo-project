// import axios from "axios";
// import { supabase } from "../lib/supabase";
// import { BACKEND_URL } from "../constants/ip";

// const api = axios.create({
//   baseURL: BACKEND_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const createNotification = async (notification) => {
//   try {
//     const response = await api.post("/api/notifications", notification);
//     console.log("createNotification response: ", response.data);
//     return response.data;
//   } catch (error) {
//     console.log("createNotification error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.message || "Could not create notification",
//     };
//   }
// };

// export const fetchNotifications = async (receiverId) => {
//   try {
//     const response = await api.get(`/api/notifications/${receiverId}`);
//     return response.data;
//   } catch (error) {
//     console.log("fetchNotifications error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.message || "Could not fetch notifications",
//     };
//   }
// };


import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.log("notification error: ", error);
      return { success: false, msg: "Something went wrong!" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("notification error: ", error);
    return { success: false, msg: "Something went wrong!" };
  }
};

export const fetchNotifications = async (receiverId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
            *,
            sender: senderId(id, name, avatar)
          `
      )
      .eq("receiverId", receiverId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("fetchNotifications error: ", error);
      return { success: false, msg: "Could not fetch notifications" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("fetchNotifications error: ", error);
    return { success: false, msg: "Could not fetch notifications" };
  }
};