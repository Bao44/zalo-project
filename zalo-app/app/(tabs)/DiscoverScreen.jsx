import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, Entypo, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const DiscoverScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Bọc danh sách trong ScrollView để tránh lỗi tràn màn hình */}
      <ScrollView style={{ marginTop: 0 }}>
        <View style={{ marginTop: 0 }}>
          <TouchableOpacity style={styles.item}>
            <Ionicons name="videocam" size={24} color="#FF5722" />
            <Text style={styles.text}>Zalo Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <FontAwesome5 name="gamepad" size={24} color="green" />
            <Text style={styles.text}>Game Center</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Entypo name="calendar" size={24} color="orange" />
            <Text style={styles.text}>Dịch vụ đời sống</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <MaterialCommunityIcons name="finance" size={24} color="red" />
            <Text style={styles.text}>Tiện ích tài chính</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <FontAwesome5 name="building" size={24} color="blue" />
            <Text style={styles.text}>Dịch vụ công</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Ionicons name="layers" size={24} color="lightblue" />
            <Text style={styles.text}>Mini App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 25, // Giảm padding để các item sát nhau hơn
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  text: {
    color: "black",
    fontSize: 20, // Điều chỉnh kích thước chữ để phù hợp
    marginLeft: 30,
  },
};

export default DiscoverScreen;
