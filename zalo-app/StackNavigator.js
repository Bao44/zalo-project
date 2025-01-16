import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MessageScreen from "./app/(tabs)/MessageScreen";
import DiaryScreen from "./app/(tabs)/DiaryScreen";
import PhoneBookScreen from "./app/(tabs)/PhoneBookScreen";
import DiscoverScreen from "./app/(tabs)/DiscoverScreen";
import PersonalScreen from "./app/(tabs)/PersonalScreen";
import Icon from "./assets/icons";

const Tab = createBottomTabNavigator();

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
            headerShown: false,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon name="message" size={32} strokeWidth={1.6} color="#0068FF"/>
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
            headerShown: false,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon name="contact" size={32} strokeWidth={1.6} color="#0068FF"/>
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
            headerShown: false,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon name="discovery" size={32} strokeWidth={1.6} color="#0068FF"/>
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
            headerShown: false,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon name="timeLine" size={32} strokeWidth={1.6} color="#0068FF"/>
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
            headerShown: false,
            tabBarLabelStyle: { color: "gray", fontSize: 14, paddingTop: 10 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Icon name="profile" size={32} strokeWidth={1.6} color="#0068FF"/>
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
    // <NavigationContainer independent={true}>
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    // </NavigationContainer>
  );
}

export default Navigation;
