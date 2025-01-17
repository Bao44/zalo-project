import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

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

const Tab = createBottomTabNavigator();

const CustomHeader = ({ tabName }) => {
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
          <TouchableOpacity>
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
          <TouchableOpacity>
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
          <TouchableOpacity>
            <Icon
              name="imageAdd"
              size={28}
              strokeWidth={1.6}
              color={theme.colors.darkLight}
            />
          </TouchableOpacity>
          <TouchableOpacity>
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
    <ScreenWrapper>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </ScreenWrapper>
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
});
