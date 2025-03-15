import * as FileSystem from "expo-file-system";
import axios from "axios";
import { supabaseUrl } from "../constants";

const BACKEND_URL = "http://192.168.1.230:3000";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    if (typeof imagePath === "string") {
      return {
        uri: `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`,
      };
    }
    return imagePath;
  } else {
    return require("../assets/images/defaultUser.png");
  }
};

export const getUserBackgroundImageSrc = (imagePath) => {
  if (imagePath) {
    if (typeof imagePath === "string") {
      return {
        uri: `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`,
      };
    }
    return imagePath;
  } else {
    return require("../assets/images/defaultBackground.jpg");
  }
};

export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
    };
  }
  return null;
};

export const downloadFile = async (url) => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    return uri;
  } catch (error) {
    console.log("Download file error:", error);
    return null;
  }
};

export const getLocalFilePath = (filePath) => {
  let fileName = filePath.split("/").pop();
  return `${FileSystem.documentDirectory}${fileName}`;
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
  try {
    console.log("Bắt đầu đọc file:", fileUri);

    // Đọc file dưới dạng base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
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
        msg:
          error.response.data.message ||
          error.response.data.msg ||
          "Could not upload media",
        details: error.response.data,
      };
    } else if (error.request) {
      console.log("Error request:", error.request);
      return {
        success: false,
        msg: "No response received from server",
      };
    } else {
      console.log("Error message:", error.message);
      return {
        success: false,
        msg: error.message,
      };
    }
  }
};
