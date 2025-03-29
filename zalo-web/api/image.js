import axios from "axios";
import { supabaseUrl } from "../constants";
import { BACKEND_URL } from '../constants/ip';
import * as FileSystem from "expo-file-system";
import defaultUserImage from "../assets/images/defaultUser.png";


const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// export const getUserImageSrc = (imagePath) => {
//   if (imagePath) {
//     if (typeof imagePath === "string") {
//       return {
//         uri: `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}`,
//       };
//     }
//     return imagePath;
//   } else {
//     return require("../assets/images/defaultUser.png");
//   }
// };
export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    console.log("imagePath", imagePath);
    if (typeof imagePath === "string") {
      return {
        uri: `${supabaseUrl}/storage/v1/object/public/uploads/${imagePath}` // Trả về string URL
      };
    }
    return imagePath; // Nếu imagePath đã là URL hoặc dạng khác
  }
  return defaultUserImage; // Trả về ảnh mặc định (đã import)
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
  // Trong hàm uploadFile ở frontend của bạn
  console.log(
    "Kích thước tệp trước khi base64:",
    await FileSystem.getInfoAsync(url)
  );
  const fileBase64 = await FileSystem.readAsStringAsync(url, {
    encoding: FileSystem.EncodingType.Base64,
  });
  console.log("Độ dài chuỗi Base64:", fileBase64.length);

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
