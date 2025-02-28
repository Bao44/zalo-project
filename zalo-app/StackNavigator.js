import { StyleSheet, TextInput, TouchableOpacity, View, Animated, Text } from "react-native";
import { useState, useEffect, useRef } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MessageScreen from "./app/(tabs)/MessageScreen";
import DiaryScreen from "./app/(tabs)/DiaryScreen";
import PhoneBookScreen from "./app/(tabs)/PhoneBookScreen";
import DiscoverScreen from "./app/(tabs)/DiscoverScreen";
import PersonalScreen from "./app/(tabs)/PersonalScreen";

import Icon from "./assets/icons";
import { theme } from "./constants/theme";
import ScreenWrapper from "./components/ScreenWrapper";
import { router, useRouter } from "expo-router";
import { hp, wp } from "./helpers/common";

const Tab = createBottomTabNavigator();

const CustomHeader = ({ tabName }) => {
  // Animation
  const [listOptions, setListOptions] = useState(false);

  // Animation hiển thị danh sách user đã chọn
  const slideAnim = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: listOptions ? 0 : 100, // Hiện hoặc ẩn
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [listOptions]);

  const router = useRouter();

  return (
    <View style={style.container}>
      <TouchableOpacity>
        <Icon
          name="search"
          size={28}
          strokeWidth={1.6}
          color={theme.colors.darkLight}
        />
      </TouchableOpacity>
      <TextInput
        style={style.textInput}
        placeholderTextColor={"white"}
        placeholder="Tìm kiếm"
      ></TextInput>
      {tabName === "message" && (
        <View style={style.containerIcons}>
          <TouchableOpacity>
            <Icon
              name="qrCode"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setListOptions(!listOptions)}>
            <Icon
              name="add"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
        </View>
      )}
      {tabName === "contacts" && (
        <View style={style.containerIcon}>
          <TouchableOpacity onPress={() => router.push("addFriend")}>
            <Icon
              name="userAdd"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
        </View>
      )}
      {tabName === "discovery" && (
        <View style={style.containerIcon}>
          <TouchableOpacity>
            <Icon
              name="qrCode"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
        </View>
      )}
      {tabName === "timeline" && (
        <View style={style.containerIcons}>
          <TouchableOpacity onPress={() => router.push("newPost")}>
            <Icon
              name="imageAdd"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("notifications")}>
            <Icon
              name="notification"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
        </View>
      )}
      {tabName === "profile" && (
        <View style={style.containerIcon}>
          <TouchableOpacity>
            <Icon
              name="setting"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
        </View>
      )}
      {/* View hiển thị danh sách các tùy chọn of MessageScreen*/}
      {listOptions === true && (
        <Animated.View style={[style.boxOptions, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity style={style.buttonOption} onPress={() => {router.push("addFriend"); setListOptions(false)}}>
            <View style={style.iconOption}>
              <Icon name="userAdd" size={22} strokeWidth={1.6} color="gray" />
            </View>
            <Text style={style.textOption}>Thêm bạn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.buttonOption} onPress={() => {router.push("newGroup"); setListOptions(false)}}>
            <View style={style.iconOption}>
              <Icon name="addGroup" size={22} strokeWidth={1.6} color="gray" />
            </View>
            <Text style={style.textOption}>Tạo nhóm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.buttonOption}>
            <View style={style.iconOption}>
              <Icon name="cloud" size={22} strokeWidth={1.6} color="gray" />
            </View>
            <Text style={style.textOption}>Cloud của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.buttonOption}>
            <View style={style.iconOption}>
              <Icon name="calendar" size={22} strokeWidth={1.6} color="gray" />
            </View>
            <Text style={style.textOption}>Lịch Yalo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.buttonOption}>
            <View style={style.iconOption}>
              <Icon name="callVideoOn" size={22} strokeWidth={1.6} color="gray" />
            </View>
            <Text style={style.textOption}>Tạo cuộc gọi nhóm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.buttonOption}>
            <View style={style.iconOption}>
              <Icon name="computer" size={22} strokeWidth={1.6} color="gray" />
            </View>
            <Text style={style.textOption}>Thiết bị đăng nhập</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

function BottomTabs() {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "white",
            height: 80,
          },
        }}
      >
        <Tab.Screen
          name="Tin nhắn"
          component={MessageScreen}
          options={{
            tabBarLabel: "Tin nhắn",
            header: () => <CustomHeader tabName="message" />,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon
                  name="message"
                  size={32}
                  strokeWidth={1.6}
                  color="#0068FF"
                />
              ) : (
                <Icon name="message" size={26} strokeWidth={1.6} />
              ),
          }}
        />

        <Tab.Screen
          name="Danh bạ"
          component={PhoneBookScreen}
          options={{
            tabBarLabel: "Danh bạ",
            header: () => <CustomHeader tabName="contacts" />,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon
                  name="contact"
                  size={32}
                  strokeWidth={1.6}
                  color="#0068FF"
                />
              ) : (
                <Icon name="contact" size={26} strokeWidth={1.6} />
              ),
          }}
        />

        <Tab.Screen
          name="Khám phá"
          component={DiscoverScreen}
          options={{
            tabBarLabel: "Khám phá",
            header: () => <CustomHeader tabName="discovery" />,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon
                  name="discovery"
                  size={32}
                  strokeWidth={1.6}
                  color="#0068FF"
                />
              ) : (
                <Icon name="discovery" size={26} strokeWidth={1.6} />
              ),
          }}
        />

        <Tab.Screen
          name="Nhật kí"
          component={DiaryScreen}
          options={{
            tabBarLabel: "Nhật kí",
            header: () => <CustomHeader tabName="timeline" />,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon
                  name="timeLine"
                  size={32}
                  strokeWidth={1.6}
                  color="#0068FF"
                />
              ) : (
                <Icon name="timeLine" size={26} strokeWidth={1.6} />
              ),
          }}
        />

        <Tab.Screen
          name="Cá nhân"
          component={PersonalScreen}
          options={{
            tabBarLabel: "Cá nhân",
            header: () => <CustomHeader tabName="profile" />,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon
                  name="profile"
                  size={32}
                  strokeWidth={1.6}
                  color="#0068FF"
                />
              ) : (
                <Icon name="profile" size={26} strokeWidth={1.6} />
              ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

const Stack = createNativeStackNavigator();

function Navigation() {
  return (
    // <ScreenWrapper>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    // </ScreenWrapper>
  );
}

export default Navigation;

const style = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primaryLight,
    height: 50,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  textInput: {
    fontSize: 18,
    width: "60%",
    color: "#FFF",
  },
  containerIcon: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "20%",
  },
  containerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "20%",
  },

  // options
  boxOptions: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    width: "50%",
  },
  buttonOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconOption: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOption: {
    fontSize: 15,
  }
});
