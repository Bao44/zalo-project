import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import users from "../../assets/dataLocals/UserLocal";
import { router } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { useLocalSearchParams } from "expo-router";
import { getConversationBetweenTwoUsers, createConversation1vs1 } from "../../api/conversationAPI";
import { getMessages, sendMessage } from "../../api/messageAPI";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../utils/socket";
import Loading from "../../components/Loading";

const ChatDetailScreen = () => {
    const { user } = useAuth();
    const { type, data, conver } = useLocalSearchParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [media, setMedia] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const recipient = type === "private" && !conversation ? parsedData : null;

    // Tham gia room và lắng nghe tin nhắn mới
    useEffect(() => {
        if (conversation?._id) {
            socket.emit("join", conversation._id); // Tham gia room dựa trên conversationId
        }

        socket.on("newMessage", (message) => {
            if (message.conversationId === conversation?._id) {
                setMessages((prev) => [message, ...prev]);
            }
        });

        return () => {
            socket.off("newMessage");
            if (conversation?._id) {
                socket.emit("leave", conversation._id); // Rời room khi thoát
            }
        };
    }, [conversation?._id]);

    // Lấy conversation và tin nhắn ban đầu
    useEffect(() => {
        const fetchConversation = async () => {
            try {
                if (!user?.id || !parsedData?._id) return;

                const response = await getConversationBetweenTwoUsers(user?.id, parsedData?._id);
                if (response.success && response.data) {
                    setConversation(response.data);
                    const messagesResponse = await getMessages(response.data._id);
                    if (messagesResponse.success) {
                        setMessages(messagesResponse.data);
                    }
                } else if (response.status === 404) {
                    setConversation(null);
                }
            } catch (error) {
                console.log("Lỗi lấy cuộc trò chuyện:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversation();
    }, [user?.id, parsedData?._id]);

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!message && attachments.length === 0 && media.length === 0 && files.length === 0) {
            return;
        }
        try {
            if (!user?.id || !parsedData?._id) {
                Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                return;
            }

            let conversationId = conversation?._id;

            if (!conversation) {
                const response = await createConversation1vs1(user.id, parsedData._id);
                if (response.success && response.data) {
                    setConversation(response.data);
                    conversationId = response.data._id;
                } else {
                    const errorMsg = response.data?.message || "Không rõ nguyên nhân";
                    Alert.alert("Lỗi", `Không thể tạo cuộc trò chuyện: ${errorMsg}`);
                    return;
                }
            }

            if (!conversationId) {
                Alert.alert("Lỗi", "Không thể xác định ID cuộc trò chuyện");
                return;
            }

            const messageData = {
                senderId: user.id,
                content: message,
                attachments,
                media,
                files,
                receiverId: parsedData._id,
            };

            // Gửi tin nhắn
            const response = await sendMessage(conversationId, messageData);
            if (response.success) {
                setMessage("");
            } else {
                Alert.alert("Lỗi", `Không thể gửi tin nhắn: ${response.data?.message || "Lỗi không xác định"}`);
            }
        } catch (error) {
            console.error("Error in handleSendMessage:", error);
            Alert.alert("Lỗi", "Không thể gửi tin nhắn: " + (error.message || "Lỗi không xác định"));
        }
    };

    const formatTime = (timestamp) => {
        const date = timestamp && new Date(timestamp);
        return date ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}` : "";
    };

    const renderMessage = ({ item, index }) => {
        const isMyMessage = item.senderId === user?.id;
        const isLastMessage = index === 0;
        const isNextSameUser = index < messages.length - 1 && messages[index + 1].senderId === item.senderId;
        const isPrevSameUser = index > 0 && messages[index - 1].senderId === item.senderId;

        const currentDate = new Date(item.createdAt).toDateString();
        const prevDate = index < messages.length - 1 ? new Date(messages[index + 1].createdAt).toDateString() : null;
        const showDateSeparator = prevDate && currentDate !== prevDate;

        const sender = users.find((u) => u.id === item.senderId);

        return (
            <>
                {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateSeparatorText}>{currentDate}</Text>
                    </View>
                )}
                {isMyMessage ? (
                    <View style={[styles.messageOfMe, isNextSameUser && { marginTop: 5 }]}>
                        <Text style={styles.textMessage}>{item.content}</Text>
                        {isLastMessage || !isNextSameUser ? (
                            <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                        ) : null}
                    </View>
                ) : (
                    <View style={[styles.messageOfOther, isNextSameUser && { marginTop: 5 }]}>
                        {!isNextSameUser ? (
                            <Image source={{ uri: sender?.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: "transparent" }]} />
                        )}
                        <View style={styles.boxMessageContent}>
                            {!isNextSameUser && (
                                <Text style={styles.textNameOthers}>{sender?.name}</Text>
                            )}
                            <Text style={styles.textMessage}>{item.content}</Text>
                            {isLastMessage || !isNextSameUser ? (
                                <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                            ) : null}
                        </View>
                    </View>
                )}
            </>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.inFoHeader}>
                        <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={() => router.back()}>
                            <Icon name="arrowLeft" size={28} strokeWidth={1.6} color={theme.colors.darkLight} />
                        </TouchableOpacity>
                        {type === "private" ? (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                                    {conversation
                                        ? conversation.members?.find((member) => member._id !== user?.id)?.name
                                        : recipient?.name}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                                    {conversation?.name}
                                </Text>
                                <Text style={styles.textNumberMember}>{conversation?.members?.length} thành viên</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.boxFeatureHeader}>
                        <TouchableOpacity>
                            <Icon name="callVideoOn" size={26} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="search" size={26} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="menu" size={26} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.contentChat}>
                    {loading ? (
                        <Loading style={{ flex: 1, justifyContent: "center", alignItems: "center",  marginTop: 200 }} ></Loading>
                    ) : messages.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text>Không có tin nhắn</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item._id}
                            renderItem={renderMessage}
                            inverted
                            ListFooterComponent={<View style={{ height: 20 }} />}
                            ListHeaderComponent={<View style={{ height: 20 }} />}
                        />
                    )}
                </View>

                <View style={styles.sendMessage}>
                    <View style={styles.boxSendMessage}>
                        <Icon name="emoji" size={28} color="gray" />
                        <TextInput
                            style={styles.textInputMessage}
                            placeholder="Tin nhắn"
                            value={message}
                            onChangeText={(text) => setMessage(text)}
                        />
                    </View>
                    {message === "" && attachments.length === 0 && media.length === 0 && files.length === 0 ? (
                        <View style={styles.boxFeatureSendMessage}>
                            <TouchableOpacity>
                                <Icon name="moreHorizontal" size={26} color="gray" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Icon name="microOn" size={26} color="gray" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Icon name="imageFile" size={26} color="gray" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleSendMessage}>
                            <Icon name="sent" size={26} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default ChatDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.primaryLight,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
    },
    inFoHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    boxInfoConversation: {
        width: wp(40),
    },
    textNameConversation: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: theme.fonts.medium,
    },
    textNumberMember: {
        fontSize: 12,
        color: theme.colors.darkLight,
    },
    boxFeatureHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: wp(34),
        paddingRight: 20,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    contentChat: {
        flex: 1,
        marginTop: 50,
        marginBottom: hp(6),
    },
    messageOfMe: {
        backgroundColor: theme.colors.skyBlue,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: "flex-end",
        marginHorizontal: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "gray",
        maxWidth: wp(70),
        borderTopRightRadius: 2,
    },
    messageOfOther: {
        alignSelf: "flex-start",
        borderColor: "gray",
        flexDirection: "row",
        marginHorizontal: 15,
        marginTop: 10,
    },
    boxMessageContent: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: wp(70),
        marginLeft: 10,
        borderColor: theme.colors.primaryLight,
        borderWidth: 0.5,
        borderTopLeftRadius: 2,
    },
    textMessage: {
        fontSize: 14,
        color: "black",
    },
    textTime: {
        fontSize: 10,
        color: "gray",
        alignSelf: "flex-end",
        marginTop: 2,
    },
    textNameOthers: {
        fontSize: 11,
        color: theme.colors.yellow,
        marginBottom: 5,
    },
    dateSeparator: {
        alignItems: "center",
        marginVertical: 10,
    },
    dateSeparatorText: {
        fontSize: 12,
        color: "gray",
        backgroundColor: "#FFF",
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    sendMessage: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFF",
        height: hp(6),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        justifyContent: "space-between",
    },
    boxSendMessage: {
        flexDirection: "row",
        alignItems: "center",
    },
    textInputMessage: {
        width: wp(50),
        height: 40,
        borderRadius: 20,
        paddingLeft: 15,
        fontSize: 16,
    },
    boxFeatureSendMessage: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: wp(30),
    },
});