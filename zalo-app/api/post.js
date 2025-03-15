// // services/postApi.js
// import axios from "axios";
// import { uploadFile } from "./image";

// const BACKEND_URL = "http://192.168.2.30:3000";

// const api = axios.create({
//   baseURL: BACKEND_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Các hàm gọi API
// export const createOrUpdatePost = async (post) => {
//   try {
//     console.log("res to backend:", post);
//     const response = await api.post("/api/posts", post);
//     return response.data;
//   } catch (error) {
//     console.log("createPost error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not create your post",
//     };
//   }
// };

// export const fetchPosts = async (limit = 10, userId = null) => {
//   try {
//     const params = { limit };
//     if (userId) params.userId = userId;

//     const response = await api.get("/api/posts", { params });
//     return response.data;
//   } catch (error) {
//     console.log("fetchPosts error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not fetch posts",
//     };
//   }
// };

// export const fetchPostDetails = async (postId) => {
//   try {
//     const response = await api.get(`/api/posts/${postId}`);
//     return response.data;
//   } catch (error) {
//     console.log("fetchPostDetails error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not fetch post details",
//     };
//   }
// };

// export const createPostLike = async (postLike) => {
//   try {
//     const response = await api.post("/api/posts/like", postLike);
//     return response.data;
//   } catch (error) {
//     console.log("postLike error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not like the post",
//     };
//   }
// };

// export const removePostLike = async (postId, userId) => {
//   try {
//     const response = await api.delete(`/api/posts/like/${postId}/${userId}`);
//     return response.data;
//   } catch (error) {
//     console.log("removePostLike error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not remove the post like",
//     };
//   }
// };

// export const createComment = async (comment) => {
//   try {
//     const response = await api.post("/api/posts/comment", comment);
//     return response.data;
//   } catch (error) {
//     console.log("comment error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not create your comment",
//     };
//   }
// };

// export const removeComment = async (commentId) => {
//   try {
//     const response = await api.delete(`/api/posts/comment/${commentId}`);
//     return response.data;
//   } catch (error) {
//     console.log("removeComment error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not remove the comment",
//     };
//   }
// };

// export const removePost = async (postId) => {
//   try {
//     const response = await api.delete(`/api/posts/${postId}`);
//     return response.data;
//   } catch (error) {
//     console.log("removePost error: ", error);
//     return {
//       success: false,
//       msg: error.response?.data?.msg || "Could not remove the post",
//     };
//   }
// };

// services/postApi.js
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";

const BACKEND_URL = "http://192.168.0.127:3000";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm để chuyển đổi URI thành chuỗi base64
const getBase64FromUri = async (uri) => {
  try {
    console.log("Đọc file từ URI:", uri);
    const fileInfo = await FileSystem.getInfoAsync(uri);

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    console.log("Lỗi đọc file base64:", error);
    return null;
  }
};

export const createOrUpdatePost = async (post) => {
  try {
    let postData = { ...post };

    if (post.file && post.file.uri) {
      const base64 = await getBase64FromUri(post.file.uri);
      if (base64) {
        postData.file = { ...post.file, base64 };
      } else {
        return { success: false, msg: "Could not read file content" };
      }
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Sending data to backend:", {
      ...postData,
      file: postData.file
        ? {
            ...postData.file,
            base64: postData.file.base64 ? "BASE64_CONTENT" : null,
          }
        : null,
    });

    const response = await api.post("/api/posts", postData, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("createPost error: ", error);
    return {
      success: false,
      msg: error.response?.data?.msg || "Could not create your post",
    };
  }
};

export const fetchPosts = async (limit = 10, userId) => {
  try {
    const params = { limit };
    if (userId) params.userId = userId;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const response = await api.get("/api/posts", {
      params,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
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
