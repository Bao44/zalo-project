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
import { countUnreadMessages, findPreviousMessage } from "../../api/messageAPI";
import Loading from "@/components/Loading";

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
        if (!user?.id) return;
        try {
          const data = await getConversations(user?.id);
          if (data.success) {
            const filteredConversations = data.data
              .filter((conversation) => {
                const isMemberDeleted = conversation.delete_history.find(
                  (deleteHistory) => deleteHistory.userId === user?.id
                );
                if (isMemberDeleted) {
                  const lastMessageTime = conversation.lastMessage?.createdAt || conversation.createdAt;
                  const lastDeleteTime = conversation.delete_history.find(
                    (deleteHistory) => deleteHistory.userId === user?.id
                  )?.time_delete;
                  return lastMessageTime > lastDeleteTime;
                } else {
                  return true;
                }
              })
              .sort((a, b) => {
                const timeA = a?.lastMessage?.createdAt
                  ? new Date(a.lastMessage.createdAt).getTime()
                  : new Date(a.createdAt).getTime();
                const timeB = b?.lastMessage?.createdAt
                  ? new Date(b.lastMessage.createdAt).getTime()
                  : new Date(b.createdAt).getTime();
                return timeB - timeA; // Sắp xếp giảm dần
              });
            setConversations(filteredConversations || []);
          } else {
            console.log("Không tìm thấy cuộc hội thoại nào!");
            setConversations([]);
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
    const handleNewConversation = (conversation) => {
      if (conversation?.members?.some((member) => member?._id === user?.id)) {
        setConversations((prev) => {
          const existingConversation = prev?.find((c) => c?._id === conversation?._id);

          let updatedConversations;
          if (!existingConversation) {
            updatedConversations = [conversation, ...prev];
          } else {
            updatedConversations = prev.map((c) =>
              c?._id === conversation?._id ? { ...c, lastMessage: conversation?.lastMessage } : c
            );
          }

          // Sắp xếp dựa trên lastMessage.createdAt hoặc createdAt
          return updatedConversations.sort((a, b) => {
            const timeA = a?.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt).getTime()
              : new Date(a.createdAt).getTime(); // Sử dụng createdAt nếu lastMessage không có
            const timeB = b?.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt).getTime()
              : new Date(b.createdAt).getTime(); // Sử dụng createdAt nếu lastMessage không có
            return timeB - timeA; // Sắp xếp giảm dần (mới nhất lên đầu)
          });
        });
      }
    };

    socket.on("newConversation", handleNewConversation);

    return () => {
      socket.off("newConversation", handleNewConversation);
    };
  }, [user?.id, conversations]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loading />
      </View>
    );
  }

  const styleNotification = (seen, senderId) => {
    // Kiểm tra xem có id của người dùng trong mảng seen không
    if (senderId !== user?.id) {
      const isSeen = seen?.some((userId) => userId === user?.id);
      if (!isSeen) {
        return {
          color: "black",
          fontWeight: "bold",
        };
      }
    }
  }



  const iconNotification = async (conversationId) => {
    if (!user?.id) return; // Kiểm tra xem người dùng đã đăng nhập hay chưa
    // Đếm số lượng tin nhắn chưa đọc
    const count = await countUnreadMessages(conversationId, user?.id);
    if (count?.success) {
      if (count?.data?.count === 1) {
        return (<View style={{ width: 10, height: 10, backgroundColor: "red", borderRadius: 5, position: "absolute", right: 15, bottom: 15 }}></View>);
      } else if (count?.data?.count > 1) {
        return (
          <View style={{ width: 20, height: 20, backgroundColor: "red", borderRadius: 10, position: "absolute", right: 15, bottom: 15, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>{count?.data?.count}</Text>
          </View>
        );
      } else if (count?.data?.count > 99) {
        return (
          <View style={{ width: 20, height: 20, backgroundColor: "red", borderRadius: 10, position: "absolute", right: 15, bottom: 15, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>99+</Text>
          </View>
        );
      }
    } else {
      console.log("Lỗi khi đếm số lượng tin nhắn chưa đọc:", count.error);
    }
  }

  // Tin nhắn Previous
  const handlePreviousMessage = async (conversationId, messageId) => {
    if (!user?.id) return; // Kiểm tra xem người dùng đã đăng nhập hay chưa
    try {
      const response = await findPreviousMessage(conversationId, messageId);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API tìm kiếm tin nhắn trước đó:", error);
    }
  };

  return (
    <View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item?._id?.toString()}
        scrollEnabled={true}
        renderItem={({ item }) => (
          item?.type === "private" ? (
            <TouchableOpacity
              style={styles.buttonMessage}
              onPress={() =>
                router.push({ pathname: "chatDetailScreen", params: { type: "private", data: JSON.stringify(item?.members.filter((f) => f._id !== user?.id)[0]) } })
              }
            >
              {(() => {
                const otherMember = item?.members.find((u) => u._id !== user?.id);
                return (
                  <Avatar uri={otherMember?.avatar} style={styles.avatarConversation} />
                );
              })()}
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={[styles.textNameConversation, styleNotification(item?.lastMessage?.seen, item?.lastMessage?.senderId)]} numberOfLines={1} ellipsizeMode="tail">
                    {item?.members.find((u) => u._id !== user?.id)?.name || "Unknown User"}
                  </Text>
                  <Text style={[styles.textTimeConversation, styleNotification(item?.lastMessage?.seen, item?.lastMessage?.senderId)]}>
                    {item?.lastMessage ? formatTime(item?.lastMessage?.createdAt) : formatTime(item?.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.textMessage, styleNotification(item?.lastMessage?.seen, item?.lastMessage?.senderId)]} numberOfLines={1} ellipsizeMode="tail">
                  {item?.type === "private" ? (
                    item?.lastMessage?.senderId === user?.id && item?.lastMessage?.type !== "notification" ? "Bạn: " : "")
                    : (
                      item?.lastMessage?.senderId === user?.id && item?.lastMessage?.type !== "notification" ? "Bạn: " : `${item?.members.find((u) => u._id !== user?.id)?.name}: `
                    )}
                  {item?.lastMessage?.revoked ? "[Tin nhắn đã được thu hồi]" : (
                    item?.lastMessage?.content ? item?.lastMessage?.content : "" ||
                      item?.lastMessage?.attachments?.length > 0 ? "[Ảnh]" : "" ||
                        item?.lastMessage?.media?.fileName ? `[Media] ${item?.lastMessage?.media?.fileName}` : "" ||
                          item?.lastMessage?.files?.fileName ? `[File] ${item?.lastMessage?.files?.fileName}` : "" ||
                    "Hãy là người đầu tiên nhắn tin!"
                  )}
                </Text>
              </View>
              {iconNotification(item?._id)}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buttonMessage}
              onPress={() =>
                router.push({ pathname: "chatDetailScreen", params: { type: item?.type, convertId: item?._id } })
              }
            >
              {item?.avatar === null || item?.avatar === "" ? (
                item?.members?.length === 3 ? (
                  <View style={[styles.containerAvatar3, { width: 50, height: 50 }]}>
                    <Avatar
                      style={[styles.avatar3, styles.top3]}
                      uri={item?.members[0].avatar}
                    />
                    <Avatar
                      style={[styles.avatar3, styles.bottomLeft3]}
                      uri={item?.members[1].avatar}
                    />
                    <Avatar
                      style={[styles.avatar3, styles.bottomRight3]}
                      uri={item?.members[2].avatar}
                    />
                  </View>
                ) : (
                  <View style={[styles.containerAvatar4, { width: 60, height: 60 }]}>
                    <Avatar
                      style={[styles.avatar4, styles.topLeft4]}
                      uri={item?.members[0].avatar}
                    />
                    <Avatar
                      style={[styles.avatar4, styles.topRight4]}
                      uri={item?.members[1].avatar}
                    />
                    <Avatar
                      style={[styles.avatar4, styles.bottomLeft4]}
                      uri={item?.members[2].avatar}
                    />
                    {item?.members?.length > 4 ? (
                      <View style={styles.moreContainer4}>
                        <Text style={styles.moreText4}>+{item?.members?.length - 3}</Text>
                      </View>
                    ) : (
                      <Avatar
                        style={[styles.avatar4, styles.bottomRight4]}
                        uri={item?.members[3].avatar}
                      />
                    )}
                  </View>
                )
              ) : (
                <Image
                  style={styles.avatarConversation}
                  source={{ uri: item?.avatar }}
                />
              )}
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={[styles.textNameConversation, styleNotification(item?.lastMessage?.seen, item?.lastMessage?.senderId)]} numberOfLines={1} ellipsizeMode="tail">
                    {item?.name || "Unnamed Group"}
                  </Text>
                  <Text style={[styles.textTimeConversation, styleNotification(item?.lastMessage?.seen, item?.lastMessage?.senderId)]}>
                    {item?.lastMessage ? formatTime(item?.lastMessage.createdAt) : formatTime(item?.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.textMessage, styleNotification(item?.lastMessage?.seen, item?.lastMessage?.senderId)]} numberOfLines={1} ellipsizeMode="tail">
                  {
                    item?.lastMessage && item?.lastMessage?.type !== "notification"
                      ? item?.lastMessage?.senderId === user?.id
                        ? "Bạn: "
                        : (() => {
                          const sender = item?.members.find((u) => u._id === item?.lastMessage?.senderId);
                          return sender ? `${sender.name}: ` : "";
                        })()
                      : ""
                  }
                  {item?.lastMessage?.revoked ? "[Tin nhắn đã được thu hồi]" : (
                    item?.lastMessage?.content ? item?.lastMessage?.content : "" || item?.lastMessage?.attachments?.length > 0 ? "[Ảnh]" : "" ||
                      item?.lastMessage?.media?.fileName ? `[Media] ${item?.lastMessage?.media?.fileName}` : "" ||
                        item?.lastMessage?.files?.fileName ? `[File] ${item?.lastMessage?.files?.fileName}` : "" || "No messages yet"
                  )}
                </Text>
              </View>
              {iconNotification(item?._id)}
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
    width: "85%"
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
