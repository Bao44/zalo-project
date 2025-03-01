import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import React from "react";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Groups from "../../assets/dataLocals/GroupLocal";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Path } from "react-native-svg";
import { getConversations } from "../../api/conversationAPI";

const MessageScreen = () => {
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

  //get conversations
  const [userId, setUserId] = useState("67b8cbdb2dd3b2334bd64726");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations(userId);
        setConversations(data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  // Router
  const router = useRouter();
  return (
    <View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id.toString()}
        scrollEnabled={true}
        renderItem={({ item }) => (
          (item.type === "private") ? (
            <TouchableOpacity style={styles.buttonMessage} onPress={() => router.push({ pathname: "chatDetailScreen", params: { conversationId: item._id } })}>
              <Image style={styles.avatarConversation} source={{ uri: (item.members.filter((u) => u._id !== userId))[0].avatar }} />
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{(item.members.filter((u) => u._id !== userId))[0].name}</Text>
                  <Text style={styles.textTimeConversation}>20:00</Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">{item.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buttonMessage} onPress={() => router.push({ pathname: "chatDetailScreen", params: { conversationId: item._id } })}>
              {item.avatar === null ?
                (item.members.length === 3 ?
                  <View style={[styles.containerAvatar3, { width: 50, height: 50 }]}>
                    {/* Ảnh 1 - Góc trên */}
                    <Image style={[styles.avatar3, styles.top3]} source={{ uri: item.members[0].avatar }} />

                    {/* Ảnh 2 - Góc dưới trái */}
                    <Image style={[styles.avatar3, styles.bottomLeft3]} source={{ uri: item.members[1].avatar }} />

                    {/* Ảnh 3 - Góc dưới phải */}
                    <Image style={[styles.avatar3, styles.bottomRight3]} source={{ uri: item.members[2].avatar }} />
                  </View>
                  :
                  <View style={[styles.containerAvatar4, { width: 60, height: 60 }]}>
                    {/* Ảnh 1 - Trên trái (dịch vào trung tâm) */}
                    <Image style={[styles.avatar4, styles.topLeft4]} source={{ uri: item.members[0].avatar }} />

                    {/* Ảnh 2 - Trên phải (dịch vào trung tâm) */}
                    <Image style={[styles.avatar4, styles.topRight4]} source={{ uri: item.members[1].avatar }} />

                    {/* Ảnh 3 - Dưới trái (dịch vào trung tâm) */}
                    <Image style={[styles.avatar4, styles.bottomLeft4]} source={{ uri: item.members[2].avatar }} />

                    {/* Ảnh 4 - Dưới phải hoặc +N */}
                    {item.members.length > 4 ? (
                      <View style={styles.moreContainer4}>
                        <Text style={styles.moreText4}>+{item.members.length - 3}</Text>
                      </View>
                    ) : (
                      <Image style={[styles.avatar4, styles.bottomRight4]} source={{ uri: item.members[3].avatar }} />
                    )}
                  </View>
                )
                :
                <Image style={styles.avatarConversation} source={{ uri: item.avatar }} />
              }
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                  {
                    item?.lastMessage ? (
                      <Text style={styles.textTimeConversation}>{formatTime(item.lastMessage.at(-1).createdAt)}</Text>
                    ) : (
                      <Text style={styles.textTimeConversation}>{formatTime(item.createdAt)}</Text>
                    )
                  }
                </View>
                {
                  item?.lastMessage ? (
                    <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">{(item.lastMessage.content)}</Text>
                  ) : (
                    <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">Bạn hãy là người mở đầu cuộc trò chuyện</Text>
                  )
                }
              </View>
            </TouchableOpacity>
          )
        )}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity style={styles.buttonMessage}>
              <Image style={styles.avatarConversation} source={{ uri: "https://cdn-icons-png.flaticon.com/512/5179/5179930.png" }} />
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">Cloud của tôi</Text>
                  <Text style={styles.textTimeConversation}>T2</Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">Chào bạn!</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonMessage}>
              <Image style={styles.avatarConversation} source={{ uri: "https://files.oaiusercontent.com/file-S29GAhgtK2jZq8CjjV1y1X?se=2025-02-14T17%3A04%3A04Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D35a8de2a-ee44-465f-844c-c6e30361e857.webp&sig=giMVwSi5xB4xYrJquNWFYjIJwk8MOM2PVTo9RXGmheY%3D" }} />
              <View style={styles.boxContentButton}>
                <View style={styles.boxNameConversation}>
                  <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">Tâm sự cùng AI Yalo</Text>
                  <Text style={styles.textTimeConversation}>T2</Text>
                </View>
                <Text style={styles.textMessage} numberOfLines={1} ellipsizeMode="tail">Chào bạn!</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text>Dễ dàng tìm kiếm và trò chuyện với bạn bè</Text>
            <TouchableOpacity style={styles.buttonSearchFiendFooter} onPress={() => router.navigate("SearchFriend")}>
              <Text style={styles.textButtonSearchFriendFooter}>Tìm thêm bạn</Text>
            </TouchableOpacity>
          </View>
        )
        }
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
