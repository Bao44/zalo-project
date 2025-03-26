import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { getConversations } from "../../api/conversationAPI";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import socket from "../../utils/socket";
import { useCallback } from "react";

const MessageScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  // Format time
  const formatTime = (messageTime) => {
    const diff = (Date.now() - new Date(messageTime)) / 1000;

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    if (diff < 604800) return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][new Date(messageTime).getDay()];

    const date = new Date(messageTime);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Load conversations
  useFocusEffect(
    useCallback(() => {
      const fetchConversations = async () => {
        try {
          const data = await getConversations(user?.id);
          if (data.success) {
            setConversations(data.data)
          } else {
            console.log("Không tìm thấy cuộc hội thoại nào!")
          }
        } catch (error) {
          console.error("Failed to fetch conversations:", error);
          setConversations([]);
        } finally {
          setLoading(false);
        }
      };

      fetchConversations();
    }, [user?.id])
  );

  //Nhận conversation mới
  useEffect(() => {
    socket.on("newConversation", (conversation) => {
      if (conversation.members.some((member) => member?._id === user?.id)) {
        setConversations((prev) => {
          // Kiểm tra xem conversation đã tồn tại trong danh sách chưa
          const existingConversation = prev.find((c) => c._id === conversation._id);

          if (!existingConversation) {
            // Nếu chưa có, thêm conversation mới vào đầu danh sách
            return [conversation, ...prev];
          } else {
            // Nếu đã có, cập nhật lastMessage của conversation đó
            return prev.map((c) =>
              c._id === conversation._id ? { ...c, lastMessage: conversation.lastMessage } : c
            );
          }
        });
      }
    });

    return () => {
      socket.off("newConversation");
    };
  }, [user?.id, conversations]); // Thêm conversations vào dependency nếu cần

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id.toString()}
        scrollEnabled={true}
        renderItem={({ item }) => (
          item.type === "private" ? (
            <TouchableOpacity
              style={styles.buttonMessage}
              onPress={() =>
                router.push({ pathname: "chatDetailScreen", params: { type: "private", data: JSON.stringify(item.members.filter((f) => f._id !== user?.id)[0]) } })
              }
            >
              {(() => {
                const otherMember = item.members.find((u) => u._id !== user?.id);
                return (
                  <Avatar uri={otherMember.avatar} style={styles.avatarConversation} />
                );
              })()}
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                    {item.members.find((u) => u._id !== user?.id)?.name || "Unknown User"}
                  </Text>
                  <Text style={styles.textTimeConversation}>
                    {item?.lastMessage ? formatTime(item.lastMessage.createdAt) : formatTime(item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">
                  {item?.lastMessage?.content || "No messages yet"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buttonMessage}
              onPress={() =>
                router.push({ pathname: "chatDetailScreen", params: { type: item?.type, converId: item?._id } })
              }
            >
              {item.avatar === null || item.avatar === "" ? (
                item.members.length === 3 ? (
                  <View style={[styles.containerAvatar3, { width: 50, height: 50 }]}>
                    <Avatar
                      style={[styles.avatar3, styles.top3]}
                      uri={item.members[0].avatar}
                    />
                    <Avatar
                      style={[styles.avatar3, styles.bottomLeft3]}
                      uri={item.members[1].avatar}
                    />
                    <Avatar
                      style={[styles.avatar3, styles.bottomRight3]}
                      uri={item.members[2].avatar}
                    />
                  </View>
                ) : (
                  <View style={[styles.containerAvatar4, { width: 60, height: 60 }]}>
                    <Avatar
                      style={[styles.avatar4, styles.topLeft4]}
                      uri={item.members[0].avatar}
                    />
                    <Avatar
                      style={[styles.avatar4, styles.topRight4]}
                      uri={item.members[1].avatar}
                    />
                    <Avatar
                      style={[styles.avatar4, styles.bottomLeft4]}
                      uri={item.members[2].avatar}
                    />
                    {item.members.length > 4 ? (
                      <View style={styles.moreContainer4}>
                        <Text style={styles.moreText4}>+{item.members.length - 3}</Text>
                      </View>
                    ) : (
                      <Avatar
                        style={[styles.avatar4, styles.bottomRight4]}
                        uri={item.members[3].avatar}
                      />
                    )}
                  </View>
                )
              ) : (
                <Image
                  style={styles.avatarConversation}
                  source={{ uri: item.avatar}}
                />
              )}
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                    {item.name || "Unnamed Group"}
                  </Text>
                  <Text style={styles.textTimeConversation}>
                    {item.lastMessage ? formatTime(item.lastMessage.createdAt) : formatTime(item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">
                  {item.lastMessage?.content || "Bạn hãy là người mở đầu cuộc trò chuyện"}
                </Text>
              </View>
            </TouchableOpacity>
          )
        )}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity style={styles.buttonMessage}>
              <Image
                style={styles.avatarConversation}
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/5179/5179930.png" }}
              />
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                    Cloud của tôi
                  </Text>
                  <Text style={styles.textTimeConversation}>T2</Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">
                  Chào bạn!
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonMessage}>
              <Image
                style={[styles.avatarConversation, { resizeMode: 'cover' }]}
                source={require("../../assets/images/yalo-ai.png")}
              />
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                    Tâm sự cùng AI Yalo
                  </Text>
                  <Text style={styles.textTimeConversation}>T2</Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">
                  Chào bạn!
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text>Dễ dàng tìm kiếm và trò chuyện với bạn bè</Text>
            <TouchableOpacity
              style={styles.buttonSearchFiendFooter}
              onPress={() => router.push("addFriend")}
            >
              <Text style={styles.textButtonSearchFriendFooter}>Tìm thêm bạn</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  // button group
  buttonMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    paddingLeft: 20,
    height: hp(9),
    backgroundColor: "#FFF",
  },
  textTimeConversation: {
    color: "gray",
    fontSize: 14,
    marginBottom: 10
  },
  textNameConversation: {
    fontSize: 18,
    width: "80%"
  },
  textMessage: {
    color: "gray",
    fontSize: 16,
    width: "90%"
  },
  boxContentButton: {
    width: wp(75),
    height: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    justifyContent: 'center',
  },
  avatarConversation: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  boxNameConversation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15
  },

  // Avatar group 3 người
  containerAvatar3: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatar3: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: "absolute",
    borderWidth: 2,
    borderColor: "white",
  },
  top3: {
    top: "-10%",
    left: "50%",
    transform: [{ translateX: -16 }],
  },
  bottomLeft3: {
    bottom: "-5%",
    left: "-5%",
  },
  bottomRight3: {
    bottom: "-5%",
    right: "-5%",
  },

  // Avatar group 4 người
  containerAvatar4: {
    position: "relative",
  },
  avatar4: {
    width: 32,
    height: 32,
    borderRadius: 20,
    position: "absolute",
    borderWidth: 2,
    borderColor: "white",
  },
  topLeft4: {
    top: "2%",
    left: "2%",
  },
  topRight4: {
    top: "2%",
    right: "2%",
  },
  bottomLeft4: {
    bottom: "2%",
    left: "2%",
  },
  bottomRight4: {
    bottom: "2%",
    right: "2%",
  },
  moreContainer4: {
    position: "absolute",
    bottom: "2%",
    right: "2%",
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  moreText4: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Footer
  footer: {
    height: hp(15),
    justifyContent: "space-evenly",
    alignItems: "center",
    // backgroundColor: theme.colors.darkLight
  },
  buttonSearchFiendFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  textButtonSearchFriendFooter: {
    color: "#FFF",
    fontSize: 16
  },


});
