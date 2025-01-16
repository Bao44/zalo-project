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

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "white",
            height: 60,
          },
        }}
      >
        <Tab.Screen
          name="Tin nhắn"
          component={MessageScreen}
          options={{
            tabBarLabel: "Tin nhắn",
            headerShown: false,
            tabBarLabelStyle: { color: "white", fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="home" size={30} color="white" />
              ) : (
                <AntDesign name="home" size={30} color="gray" />
              ),
          }}
        />

        <Tab.Screen
          name="Danh bạ"
          component={PhoneBookScreen}
          options={{
            tabBarLabel: "Danh bạ",
            headerShown: false,
            tabBarLabelStyle: { color: "white", fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Fontisto name="music-note" size={24} color="white" />
              ) : (
                <Fontisto name="music-note" size={24} color="gray" />
              ),
          }}
        />

        <Tab.Screen
          name="Khám phá"
          component={DiaryScreen}
          options={{
            tabBarLabel: "Khám phá",
            headerShown: false,
            tabBarLabelStyle: { color: "white", fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome5 name="globe-asia" size={24} color="white" />
              ) : (
                <FontAwesome5 name="globe-asia" size={24} color="gray" />
              ),
          }}
        />

        <Tab.Screen
          name="Nhật kí"
          component={DiscoverScreen}
          options={{
            tabBarLabel: "Nhật kí",
            headerShown: false,
            tabBarLabelStyle: { color: "white", fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome5 name="globe-asia" size={24} color="white" />
              ) : (
                <FontAwesome5 name="globe-asia" size={24} color="gray" />
              ),
          }}
        />

        <Tab.Screen
          name="Cá nhân"
          component={PersonalScreen}
          options={{
            tabBarLabel: "Cá nhân",
            headerShown: false,
            tabBarLabelStyle: { color: "white", fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome5 name="globe-asia" size={24} color="white" />
              ) : (
                <FontAwesome5 name="globe-asia" size={24} color="gray" />
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
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
