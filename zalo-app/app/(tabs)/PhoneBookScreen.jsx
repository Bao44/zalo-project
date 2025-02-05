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
    <View style={styles.container}>
      <View style={styles.boxTypeContact}>
        <TouchableOpacity onPress={() => handelTypeContact("friends")} style={typeContact === "friends" ? styles.typeContactActive : styles.typeContactNoActive}>
          <Text style={typeContact === "friends" ? styles.textTypeContactActive : styles.textTypeContact}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handelTypeContact("groups")} style={typeContact === "groups" ? styles.typeContactActive : styles.typeContactNoActive}>
          <Text style={typeContact === "groups" ? styles.textTypeContactActive : styles.textTypeContact}>Nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handelTypeContact("OA")} style={typeContact === "OA" ? styles.typeContactActive : styles.typeContactNoActive}>
          <Text style={typeContact === "OA" ? styles.textTypeContactActive : styles.textTypeContact}>OA</Text>
        </TouchableOpacity>
      </View>
      {typeContact === "friends" && <FriendsTabs />}
      {typeContact === "groups" && <GroupsTabs />}
    </View>
  );
};

export default PhoneBookScreen;

// List friends
const FriendsTabs = () => {
  const [typeListFriend, setTypeListFriend] = useState("all");
  const handelTypeListFriend = (type) => {
    setTypeListFriend(type);
  }
  return (
    <ScrollView>
      <View style={styles.listFriendContainer}>
        <View>
          <TouchableOpacity style={styles.feature}>
            <View style={styles.boxIconFeature}>
              <Icon name="userMultiple" size={32} strokeWidth={1.6} color="#FFF" />
            </View>
            <Text style={{ fontSize: 16 }}>Lời mời kết bạn ({6})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feature}>
            <View style={styles.boxIconFeature}>
              <Icon name="contact" size={32} strokeWidth={1.6} color="#FFF" />
            </View>
            <View>
              <Text style={{ fontSize: 16 }}>Danh bạ máy</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textLight }}>Các liên hệ có dùng Yalo</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feature}>
            <View style={styles.boxIconFeature}>
              <Icon name="birthdayCake" size={32} strokeWidth={1.6} color="#FFF" />
            </View>
            <Text style={{ fontSize: 16 }}>Sinh nhật</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: theme.colors.gray, height: hp(1.5) }} />

        <View style={styles.boxListFriend}>
          <TouchableOpacity onPress={() => handelTypeListFriend("all")} style={styles.typeList}>
            <Text style={typeListFriend === 'all' ? styles.textTypeListActive : styles.textTypeListNoActive}>Tất cả ({Users.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handelTypeListFriend("online")} style={styles.typeList}>
            <Text style={typeListFriend === 'online' ? styles.textTypeListActive : styles.textTypeListNoActive}>Mới truy cập ({Users.filter((user) => user.timeOnline > 0).length})</Text>
          </TouchableOpacity>
        </View>

        <View>
          {(typeListFriend === "all" ? Users : Users.filter((user) => user.timeOnline > 0)).map((user, index) => (
            <TouchableOpacity key={index} style={styles.buttonFriend}>
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                <Image style={styles.image} source={{ uri: user.avatar }} />
                <Text style={styles.textNameFriend}>{user.name}</Text>
              </View>
              <View style={styles.boxContactMethod}>
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

const GroupsTabs = () => {
  return (
    <View>
      <Text>Hello, NativeWind!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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

  // style list friend
  listFriendContainer: {
    flex: 1,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(7),
  },
  boxIconFeature: {
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    padding: 5,
    margin: 20
  },
  boxListFriend: {
    height: hp(8),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: theme.colors.gray,
    borderBottomWidth: 1
  },
  typeList: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(4),
    paddingHorizontal: 20,
    backgroundColor: theme.colors.gray,
    borderRadius: 20,
    marginLeft: 20
  },
  textTypeListActive: {
    fontSize: 14,
    fontWeight: theme.fonts.bold
  },
  textTypeListNoActive: {
    fontSize: 14,
  },

  // Component friend
  buttonFriend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20
  },
  textNameFriend: {
    fontSize: 16,
    fontWeight: theme.fonts.bold
  },
  boxContactMethod: {
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(20)
  },

});