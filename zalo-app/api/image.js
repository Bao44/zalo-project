import * as FileSystem from "expo-file-system";
import axios from 'axios';

const BACKEND_URL = 'http://192.168.0.127:3000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    if (typeof imagePath === 'string') {
      return {
        uri: `${BACKEND_URL}/api/images/url/${encodeURIComponent(imagePath)}`,
      };
    }
    return imagePath; // Nếu đã là object có uri
  } else {
    return require("../assets/images/defaultUser.png");
  }
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
    // Đọc file dưới dạng base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Gọi API backend để upload
    const response = await api.post('/api/images/upload', {
      folderName,
      fileBase64,
      isImage
    });
    
    return response.data;
  } catch (error) {
    console.log("Upload file error:", error);
    return { 
      success: false, 
      msg: error.response?.data?.message || "Could not upload media" 
    };
  }
};