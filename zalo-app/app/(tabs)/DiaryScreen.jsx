import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import Avatar from "../../components/Avatar";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../api/user";
import { fetchPosts } from "../../api/post";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";

var limit = 0;
const DiaryScreen = () => {
  const router = useRouter();
  const { user, setAuth } = useAuth();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const handlePostEvent = async (payload) => {
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }

    if (payload.eventType == "DELETE" && payload.old.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.filter(
          (post) => post.id !== payload.old.id
        );
        return updatedPosts;
      });
    }

    if (payload.eventType == "UPDATE" && payload?.new?.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.map((post) => {
          if (post.id == payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };

  const handleNewNotification = async (payload) => {
    if (payload.eventType === "INSERT" && payload.new.id) {
      setNotificationCount((prevCount) => prevCount + 1);
    }
  };

  // laod realtime
  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    // getPosts();

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async () => {
    if (!hasMore) return;

    limit += 10;

    let res = await fetchPosts(limit);

    if (res.success) {
      if (res.data.length < limit) {
        setHasMore(false); // Không còn dữ liệu để tải thêm
      }
      setPosts((prevPosts) => {
        // Loại bỏ các bài post trùng lặp dựa trên id
        const newPosts = res.data.filter(
          (newPost) => !prevPosts.some((post) => post.id === newPost.id)
        );
        return [...prevPosts, ...newPosts];
      });
    } else {
      console.log("Error fetching posts:", res.msg);
    }
  };

  return (
    <ScrollView>
      {/* Header */}
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={() => router.push("profile")}>
            <Avatar
              uri={user?.avatar}
              size={hp(6.5)}
              rounded={theme.radius.xxl * 100}
            />
          </Pressable>
          <Pressable
            style={styles.pressableNewPost}
            onPress={() => router.push("newPost")}
          >
            <Text style={{ fontSize: 20, color: theme.colors.textLight }}>
              Hôm nay bạn thế nào?
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: hp(4),
          }}
        >
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="imageFile" size={20} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="callVideoOn" size={20} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="contact" size={20} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Album</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="timeLine" size={20} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Kỉ niệm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grayLine}></View>

      {/* Post */}
      <View style={styles.container}>
        <FlatList
          scrollEnabled={false}
          data={posts}
          showsVerticalScrollIndicator={false}
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
              <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />
      </View>
    </ScrollView>
  );
};

export default DiaryScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(2),
  },
  textInput: {
    fontSize: 16,
    width: "60%",
    color: "#FFF",
  },
  pressableNewPost: {
    marginHorizontal: wp(3),
    paddingVertical: hp(1.5),
    marginRight: wp(35),
    width: wp(80),
  },
  buttonNewPost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.grayLight,
    borderRadius: 20,
    width: wp(22),
    height: hp(4),
  },
  textButtonNewPost: {
    color: "black",
    fontSize: 12,
    marginLeft: wp(2),
  },
  grayLine: {
    marginTop: hp(1),
    height: 10,
    backgroundColor: theme.colors.gray,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
});
