// services/postApi.js
import axios from "axios";

const BACKEND_URL = "http://192.168.40.121:3000";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Các hàm gọi API
export const createOrUpdatePost = async (post) => {
  try {
    const response = await api.post("/api/posts", post);
    return response.data;
  } catch (error) {
    console.log("createPost error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not create your post",
    };
  }
};

export const fetchPosts = async (limit = 10, userId = null) => {
  try {
    const params = { limit };
    if (userId) params.userId = userId;

    const response = await api.get("/api/posts", { params });
    return response.data;
  } catch (error) {
    console.log("fetchPosts error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not fetch posts",
    };
  }
};

export const fetchPostDetails = async (postId) => {
  try {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log("fetchPostDetails error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not fetch post details",
    };
  }
};

export const createPostLike = async (postLike) => {
  try {
    const response = await api.post("/api/posts/like", postLike);
    return response.data;
  } catch (error) {
    console.log("postLike error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not like the post",
    };
  }
};

export const removePostLike = async (postId, userId) => {
  try {
    const response = await api.delete(`/api/posts/like/${postId}/${userId}`);
    return response.data;
  } catch (error) {
    console.log("removePostLike error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not remove the post like",
    };
  }
};

export const createComment = async (comment) => {
  try {
    const response = await api.post("/api/posts/comment", comment);
    return response.data;
  } catch (error) {
    console.log("comment error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not create your comment",
    };
  }
};

export const removeComment = async (commentId) => {
  try {
    const response = await api.delete(`/api/posts/comment/${commentId}`);
    return response.data;
  } catch (error) {
    console.log("removeComment error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not remove the comment",
    };
  }
};

export const removePost = async (postId) => {
  try {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log("removePost error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not remove the post",
    };
  }
};
