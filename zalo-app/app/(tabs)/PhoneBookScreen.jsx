import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { hp, wp } from "../../helpers/common"
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import Users from "../../assets/dataLocals/UserLocal";

const PhoneBookScreen = () => {
  const [typeContact, setTypeContact] = useState("friends");
  const handelTypeContact = (type) => {
    setTypeContact(type);
  }
  return (
    <View style={style.container}>
      <View style={style.boxTypeContact}>
        <TouchableOpacity onPress={() => handelTypeContact("friends")} style={typeContact === "friends" ? style.typeContactActive : style.typeContactNoActive}>
          <Text style={typeContact === "friends" ? style.textTypeContactActive : style.textTypeContact}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handelTypeContact("groups")} style={typeContact === "groups" ? style.typeContactActive : style.typeContactNoActive}>
          <Text style={typeContact === "groups" ? style.textTypeContactActive : style.textTypeContact}>Nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handelTypeContact("OA")} style={typeContact === "OA" ? style.typeContactActive : style.typeContactNoActive}>
          <Text style={typeContact === "OA" ? style.textTypeContactActive : style.textTypeContact}>OA</Text>
        </TouchableOpacity>
      </View>
      {typeContact === "friends" && <FriendsTabs />}

    </View>
  );
};

export default PhoneBookScreen;

const FriendsTabs = () => {
  return (
    <ScrollView>
      <View style={style.container}>
        <View>
          <TouchableOpacity style={style.boxFeature}>
            <View style={{ backgroundColor: theme.colors.primary, borderRadius: 15, padding: 5, margin: 20 }}>
              <Icon name="userMultiple" size={32} strokeWidth={1.6} color="#FFF" />
            </View>
            <Text style={{ fontSize: 16 }}>Lời mời kết bạn ({6})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.boxFeature}>
            <View style={{ backgroundColor: theme.colors.primary, borderRadius: 15, padding: 5, margin: 20 }}>
              <Icon name="contact" size={32} strokeWidth={1.6} color="#FFF" />
            </View>
            <View>
              <Text style={{ fontSize: 16 }}>Danh bạ máy</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textLight }}>Các liên hệ có dùng Yalo</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={style.boxFeature}>
            <View style={{ backgroundColor: theme.colors.primary, borderRadius: 15, padding: 5, margin: 20 }}>
              <Icon name="birthdayCake" size={32} strokeWidth={1.6} color="#FFF" />
            </View>
            <Text style={{ fontSize: 16 }}>Sinh nhật</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: theme.colors.gray, height: hp(1.5) }} />

        <View style={{ height: hp(8), flexDirection: 'row', alignItems: 'center', borderBottomColor: theme.colors.gray, borderBottomWidth: 1 }}>
          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', height: hp(4), width: wp(25), backgroundColor: theme.colors.gray, borderRadius: 20, marginLeft: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: theme.fonts.bold }}>Tất cả</Text>
            <Text>({102})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', height: hp(4), paddingHorizontal: 15, borderColor: theme.colors.gray, borderWidth: 1, borderRadius: 20, marginLeft: 10 }}>
            <Text style={{ fontSize: 14, }}>Mới truy cập</Text>
          </TouchableOpacity>
        </View>

        <View>
          {Users.map((user, index) => (
            <TouchableOpacity key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", paddingVertical: 15, paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                <Image style={{ width: 50, height: 50, borderRadius: 25, marginRight: 20 }} source={{ uri: user.avatar }} />
                <Text style={{ fontSize: 16, fontWeight: theme.fonts.bold }}>{user.name}</Text>
              </View>
              <View style={{ marginLeft: 10, flexDirection: 'row', justifyContent: 'space-between', width: wp(20) }}>
                <TouchableOpacity>
                  <Icon name="phone" size={28} strokeWidth={1.6} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Icon name="callVideoOn" size={28} strokeWidth={1.6} color="gray" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  boxTypeContact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: hp(6),
    borderColor: theme.colors.gray,
    borderBottomWidth: 1,
    width: "100%",
  },
  textTypeContact: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  textTypeContactActive: {
    color: theme.colors.text,
    fontWeight: theme.fonts.bold,
    fontSize: 16
  },
  typeContactNoActive: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "25%",
    paddingBottom: 2,
  },
  typeContactActive: {
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "25%",
  },
  boxFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(7),
  }
});