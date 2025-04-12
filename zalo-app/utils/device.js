import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid"; // Import default

export const getDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem("device_id");

  if (!deviceId) {
    deviceId = uuid.v4(); // Gọi uuid.v4() trực tiếp
    await AsyncStorage.setItem("device_id", deviceId);
  }

  return deviceId;
};