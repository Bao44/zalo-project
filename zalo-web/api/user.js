import axios from "axios";
console.log(import.meta.env.VITE_BACKEND_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const signUp = async (email, password, name) => {
  try {
    const response = await api.post("/api/auth/signup", {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await api.post("/api/auth/signinWithDevice", {
      email,
      password,
      device_type: "web", // Gán cứng cho web
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async (userId, sessionToken) => {
  try {
    const response = await api.post("/api/auth/signout", {
      user_id: userId,
      device_type: "web", // Gán cứng cho web
      session_token: sessionToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserData = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Unknown error",
    };
  }
};

export const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/api/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkUserOnline = async (userId) => {
  try {
    const response = await api.get(`/api/users/online/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
