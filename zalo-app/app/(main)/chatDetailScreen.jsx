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
import { io } from "socket.io-client"; // Import Socket.io client

const socket = io("http://your-server-url"); // Thay bằng URL server của bạn

const ChatDetailScreen = () => {
    const { user } = useAuth();
    const { type, data } = useLocalSearchParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]); // Thêm state cho attachments
    const [media, setMedia] = useState([]); // Thêm state cho media
    const [files, setFiles] = useState([]); // Thêm state cho files

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    const recipient = type === "private" && !conversation ? parsedData : null;

    // Lấy conversation và tin nhắn ban đầu
    useEffect(() => {
        const fetchConversation = async () => {
            try {
                if (!user?.id || !parsedData?._id) return;

                const response = await getConversationBetweenTwoUsers(user?.id, parsedData?._id);
                if (response.success && response.data) {
                    setConversation(response.data);
                    const messagesResponse = await getMessages(response.data.id);
                    if (messagesResponse.success) {
                        setMessages(messagesResponse.data);
                    }
                } else if (response.status === 404) {
                    setConversation(null);
                }
            } catch (error) {
                console.log("Lỗi lấy cuộc trò chuyện:", error);
            }
        };
        fetchConversation();
    }, [user?.id, parsedData?._id]);

    // Tham gia phòng Socket.io và lắng nghe tin nhắn mới
    useEffect(() => {
        if (conversation?.id) {
            socket.emit("join", conversation.id);
            socket.on("newMessage", (newMessage) => {
                setMessages((prev) => [newMessage, ...prev]);
            });
            return () => {
                socket.off("newMessage");
                socket.emit("leave", conversation.id);
            };
        }
    }, [conversation?.id]);

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!message && attachments.length === 0 && media.length === 0 && files.length === 0) {
            return;
        }
    
        console.log("Sending message with data:", { userId: user?.id, receiverId: parsedData?._id });
    
        try {
            if (!user?.id || !parsedData?._id) {
                Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                return;
            }
    
            let conversationId = conversation?._id;
    
            if (!conversation) {
                console.log("Creating new conversation...");
                const response = await createConversation1vs1(user.id, parsedData._id);
                console.log("Create conversation response:", response);
    
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
                receiverId: parsedData._id
            };
    
            console.log("Sending message to server with conversationId:", conversationId);
            const response = await sendMessage(conversationId, messageData);
            console.log("Send message response:", response);
    
            if (response.success) {
                setMessages((prev) => [response.data, ...prev]);
                setMessage("");
                setAttachments([]);
                setMedia([]);
                setFiles([]);
            } else {
                Alert.alert("Lỗi", response.data?.message || "Không thể gửi tin nhắn (lỗi không xác định)");
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
        const isMyMessage = item.senderId === user?.id; // Sửa userId thành senderId
        const isLastMessage = index === 0;
        const isNextSameUser = index < messages.length - 1 && messages[index + 1].senderId === item.senderId;
        const isPrevSameUser = index > 0 && messages[index - 1].senderId === item.senderId;

        if (isMyMessage) {
            return (
                <View style={[styles.messageOfMe, isNextSameUser && { marginTop: 5 }]}>
                    <Text style={styles.textMessage}>{item.content}</Text>
                    {(!isPrevSameUser || isLastMessage) && (
                        <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text> // Sửa time thành createdAt
                    )}
                </View>
            );
        } else {
            const sender = users.find(u => u.id === item.senderId);
            return (
                <View style={[styles.messageOfOther, isNextSameUser && { marginTop: 5 }]}>
                    {!isNextSameUser ? (
                        <Image source={{ uri: sender?.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatar} />
                    )}
                    <View style={styles.boxMessageContent}>
                        {!isNextSameUser && (
                            <Text style={styles.textNameOthers}>{sender?.name}</Text>
                        )}
                        <Text style={styles.textMessage}>{item.content}</Text>
                        {(!isPrevSameUser || isLastMessage) && (
                            <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                        )}
                    </View>
                </View>
            );
        }
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
                                    {conversation ?
                                        conversation.members?.find(member => member._id !== user?.id)?.name :
                                        recipient?.name}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">
                                    {conversation?.name}
                                </Text>
                                <Text style={styles.textNumberMember}>
                                    {conversation?.members?.length} thành viên
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.boxFeatureHeader}>
                        <TouchableOpacity><Icon name="callVideoOn" size={26} color="#FFF" /></TouchableOpacity>
                        <TouchableOpacity><Icon name="search" size={26} color="#FFF" /></TouchableOpacity>
                        <TouchableOpacity><Icon name="menu" size={26} color="#FFF" /></TouchableOpacity>
                    </View>
                </View>

                <View style={styles.contentChat}>
                    {messages.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text>Không có tin nhắn</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item._id.toString()} // Sửa id thành _id
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
                            <TouchableOpacity><Icon name="moreHorizontal" size={26} color="gray" /></TouchableOpacity>
                            <TouchableOpacity><Icon name="microOn" size={26} color="gray" /></TouchableOpacity>
                            <TouchableOpacity><Icon name="imageFile" size={26} color="gray" /></TouchableOpacity>
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

    // Nội dung chat
    contentChat: {
        flex: 1, // Đảm bảo nội dung mở rộng giữa header và sendMessage
        marginTop: 50, // Đẩy nội dung xuống dưới header
        marginBottom: hp(6), // Đẩy nội dung lên trên sendMessage
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
    },
    messageOfOther: {
        alignSelf: "flex-start",
        borderColor: "gray",
        flexDirection: "row",
        marginHorizontal: 15,
        marginTop: 10,
    },
    boxMessageContent: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: wp(70),
        marginLeft: 10,
        borderColor: theme.colors.primaryLight,
        borderWidth: 0.5,
    },
    textMessage: {
        fontSize: 14,
        color: "black"
    },
    textTime: {
        fontSize: 10,
        color: "gray",
    },
    textNameOthers: {
        fontSize: 11,
        color: theme.colors.yellow,
        marginBottom: 5,
    },

    // Ô nhập tin nhắn
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