import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import Background from "../../components/Background";
import { fetchPosts } from "../../api/post";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import ScreenWrapper from "../../components/ScreenWrapper";

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const getPosts = async () => {
    // call api to get posts
    if (!hasMore) return null;

    limit = limit + 4;

    let res = await fetchPosts(limit, user.id);
    if (res.success) {
      if (posts.length === res.data.length) {
        setHasMore(false);
      }
      setPosts(res.data);
    }
  };

  return (
    <FlatList
      data={posts}
      ListHeaderComponent={<UserHeader user={user} router={router} />}
      ListHeaderComponentStyle={{ marginBottom: 120 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listStyle}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PostCard item={item} currentUser={user} router={router} />
      )}
      onEndReached={() => {
        getPosts();
      }}
      onEndReachedThreshold={0}
      ListFooterComponent={
        hasMore ? (
          <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
            <Loading />
          </View>
        ) : (
          <View style={{ marginVertical: 30 }}>
            <Text style={styles.noPosts}>No more posts</Text>
          </View>
        )
      }
    />
  );
};

const UserHeader = ({ user, router }) => {
  return (
    <View style={{marginBottom: hp(2) }}>
      <Background uri={user?.background} sizeHeight={hp(26)} />
      <View style={styles.header}>
        <BackButton router={router} color="white" />
        <TouchableOpacity onPress={() => router.push("optionsUser")}>
          <Icon name="moreHorizontal" size={20} color={"white"} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          paddingHorizontal: wp(4),
          position: "absolute",
          top: hp(18),
          left: 0,
          right: 0,
        }}
      >
        <View style={styles.container}>
          <View style={{ gap: 15 }}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push("editProfile")}
            >
              <Avatar
                uri={user?.avatar}
                size={hp(14)}
                rounded={theme.radius.xxl * 100}
              />
            </TouchableOpacity>

            {/* username and bio */}
            <View style={{ alignItems: "center", gap: 4, marginTop: 10 }}>
              <Text style={styles.userName}>{user && user.name}</Text>
              {user?.bio == null || user?.bio == "" ? (
                <View>
                  <Pressable
                    style={styles.editIcon}
                    onPress={() => router.push("editBio")}
                  >
                    <Icon name="edit" strokeWidth={2.5} size={16} />
                    <Text style={styles.infoText}>
                      {" "}
                      Cập nhật giới thiệu bản thân
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => router.push("editBio")}>
                  <Text style={styles.infoText}>{user && user.bio}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: hp(2.5),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(3.5),
    alignItems: "center",
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
    alignItems: "center",
  },
  editIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  listStyle: {
    paddingHorizontal: wp(2),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
});
