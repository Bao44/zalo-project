import React, { useEffect } from "react";
import Welcome from "./welcome";
import { Linking } from "react-native";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async (event) => {
      let url = event.url || (await Linking.getInitialURL()); // Lấy URL từ deep link
      if (url) {
        const path = url.replace(/.*?:\/\//g, ""); // Lấy phần path từ URL
        if (path === "auth-callback") {
          router.push("login"); // Chuyển đến trang đăng nhập
        }
      }
    };

    // Lắng nghe sự kiện mở app qua deep link
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove(); // Hủy đăng ký khi component bị unmount
    };
  }, []);

  return <Welcome />;
};

export default Index;
