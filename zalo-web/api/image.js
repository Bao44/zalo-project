import axios from "axios";
import defaultUserImage from "../src/assets/images/img-user.png";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    console.log("imagePath", imagePath);
    if (typeof imagePath === "string") {
      return `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`; // Trả về string URL trực tiếp
    }
    return imagePath;
  }
  return defaultUserImage; // Trả về ảnh mặc định
};

export const getUserBackgroundImageSrc = (imagePath) => {
  if (imagePath) {
    if (typeof imagePath === "string") {
      return `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`;
    }
    return imagePath;
  }
  return defaultUserImage;
};

export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`;
  }
  return null;
};

export const uploadFile = async (folderName, file, isImage = true) => {
  try {
    console.log("Bắt đầu upload file:", file.name);

    // Đọc file thành base64
    const fileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Bỏ phần "data:image/..."
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await api.post("/api/images/uploads", {
      folderName,
      fileBase64,
      isImage,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        msg: error.response.data.message || "Could not upload media",
      };
    }
    return {
      success: false,
      msg: error.message,
    };
  }
};
