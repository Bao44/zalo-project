import { axiosAuth, axiosNotAuth } from "../utils/axiosConfig";
import TokenAPI from "./TokenAPI";

const signup = async (email, phoneNumber) => {
  try {
    const { data } = await axiosNotAuth.post("/api/v1/users/signup", {
      email,
      phoneNumber,
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

const verifyOtp = async (fullName, email, phoneNumber, password, otp) => {
  try {
    const { data } = await axiosNotAuth.post("/api/v1/users/verify-otp", {
      fullName,
      email,
      phoneNumber,
      password,
      otp,
    });

    if (data.status === "success") {
      TokenAPI.setAccessToken(data.data.accessToken);
      TokenAPI.setRefreshToken(data.data.refreshToken);
    }

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const login = async (phoneNumber, password) => {
  try {
    const { data } = await axiosNotAuth.post("/api/v1/users/login", {
      phoneNumber,
      password,
    });

    if (data.status === "success") {
      TokenAPI.setAccessToken(data.data.accessToken);
      TokenAPI.setRefreshToken(data.data.refreshToken);
    }

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const logout = async () => {
  try {
    const { data } = await axiosAuth.delete("/api/v1/users/logout");
    if (data.status === "success") {
      TokenAPI.removeTokens();
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = async (password, newPassword) => {
  try {
    const { data } = await axiosAuth.put("/api/v1/users/update-password", {
      password,
      newPassword,
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

const forgotPassword = async (email) => {
  try {
    const { data } = await axiosNotAuth.post("/api/v1/users/forgot-password", {
      email,
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

const getUserById = async (userId) => {
  try {
    const { data } = await axiosNotAuth.get(`/api/v1/users/${userId}`);

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    const { data } = await axiosNotAuth.get(
      `/api/v1/users?phoneNumber=${phoneNumber}`
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const getMe = async () => {
  try {
    const { data } = await axiosAuth.get("/api/v1/users/me");

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const updateMe = async (user) => {
  try {
    const { data } = await axiosAuth.put("/api/v1/users/me", user);

    return data.data;
  } catch (error) {
    console.error(error);
  }
};

const requestFriend = async (userId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/users/request-friend/${userId}`,
      {}
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const acceptFriend = async (userId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/users/accept-friend/${userId}`,
      {}
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteAcceptFriend = async (userId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/users/delete-accept-friend/${userId}`,
      {}
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const revokeFriend = async (userId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/users/revoke-friend/${userId}`,
      {}
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteFriend = async (userId) => {
  try {
    const { data } = await axiosAuth.put(
      `/api/v1/users/delete-friend/${userId}`,
      {}
    );

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

// Admin

const getAllUsers = async () => {
  try {
    const { data } = await axiosAuth.get("/api/v1/users/admin");

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (user) => {
  try {
    const { data } = await axiosAuth.post("/api/v1/users/admin", user);

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (userId, user) => {
  try {
    const { data } = await axiosAuth.put(`/api/v1/users/admin/${userId}`, user);

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (userId) => {
  try {
    const { data } = await axiosAuth.delete(`/api/v1/users/admin/${userId}`);

    return data;
  } catch (error) {
    console.log(error);
  }
};

const UserAPI = {
  signup,
  verifyOtp,
  login,
  logout,
  updatePassword,
  forgotPassword,
  getUserById,
  getUserByPhoneNumber,
  getMe,
  updateMe,
  requestFriend,
  acceptFriend,
  deleteAcceptFriend,
  revokeFriend,
  deleteFriend,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default UserAPI;
