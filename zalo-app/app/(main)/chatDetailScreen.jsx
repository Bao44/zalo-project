import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import groups from "../../assets/dataLocals/GroupLocal";
import users from "../../assets/dataLocals/UserLocal";
import { router } from "expo-router";
import { wp, hp } from "../../helpers/common";

const ChatDetailScreen = () => {
    //User
    const [user, setUser] = useState(users[0]);
    //Group
    const [convarsation, setConvarsation] = useState(groups[0]);

    //Message
    const [message, setMessage] = useState("");

    //Format time
    const formatTime = (timestamp) => {
        const date = timestamp && new Date(timestamp);
        return date ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}` : "";
    };

    // sort message by time when first render
    useEffect(() => {
        setConvarsation((prev) => ({
            ...prev,
            message: prev.message.sort((a, b) => new Date(b.time) - new Date(a.time)),
        }));
    }, [message]);

    //send message
    const sendMessage = () => {
        if (message.trim() === "") return;

        const newMessage = {
            id: convarsation.message.length + 1,
            userId: user.id,
            content: message,
            time: new Date().toISOString(),
        };

        setConvarsation((prev) => ({
            ...prev,
            message: [...prev.message, newMessage],
        }));

        setMessage(""); // Reset input
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.inFoHeader}>
                        <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={() => router.back()}>
                            <Icon name="arrowLeft" size={28} strokeWidth={1.6} color={theme.colors.darkLight} />
                        </TouchableOpacity>
                        <View style={styles.boxInfoConversation}>
                            <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{convarsation.name}</Text>
                            <Text style={styles.textNumberMember}>{convarsation.users.length} thành viên</Text>
                        </View>
                    </View>
                    <View style={styles.boxFeatureHeader}>
                        <TouchableOpacity><Icon name="callVideoOn" size={26} color="#FFF" /></TouchableOpacity>
                        <TouchableOpacity><Icon name="search" size={26} color="#FFF" /></TouchableOpacity>
                        <TouchableOpacity><Icon name="menu" size={26} color="#FFF" /></TouchableOpacity>
                    </View>
                </View>

                {/* Nội dung chat */}
                <View style={styles.contentChat}>
                    {
                        // Nếu không có tin nhắn
                        convarsation.message.length === 0 &&
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text>Không có tin nhắn</Text>
                        </View>
                    }
                    <FlatList
                        data={convarsation.message}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, index }) => (
                            (item.userId === user?.id)
                                ?
                                ((index !== convarsation.message.length - 1 && item.userId === convarsation.message[index + 1].userId) ?
                                    (
                                        <View style={[styles.messageOfMe, { marginTop: 5 }]}>
                                            <Text style={styles.textMessage}>{item.content}</Text>
                                            <Text style={styles.textTime}>{formatTime(item.time)}</Text>
                                        </View>
                                    )
                                    :
                                    (
                                        <View style={styles.messageOfMe}>
                                            <Text style={styles.textMessage}>{item.content}</Text>
                                            <Text style={styles.textTime}>{formatTime(item.time)}</Text>
                                        </View>
                                    ))
                                :
                                (index === convarsation.message.length - 1) ?
                                    (
                                        <View style={[styles.messageOfOther, { marginBottom: 5 }]}>
                                            <Image source={{ uri: (users.filter((u) => u.id === item.userId))[0].avatar }} style={styles.avatar} />
                                            <View style={styles.boxMessageContent}>
                                                <Text style={styles.textNameOthers}>{(users.filter((u) => u.id === item.userId))[0].name}</Text>
                                                <Text style={styles.textMessage}>{item.content}</Text>
                                                <Text style={styles.textTime}>{formatTime(item.time)}</Text>
                                            </View>
                                        </View>
                                    )
                                    :
                                    (item.userId === convarsation.message[index + 1].userId) ?

                                        (
                                            <View style={[styles.messageOfOther, { marginBottom: 5 }]}>
                                                <Image style={styles.avatar} />
                                                <View style={styles.boxMessageContent}>
                                                    <Text style={styles.textMessage}>{item.content}</Text>
                                                    <Text style={styles.textTime}>{formatTime(item.time)}</Text>
                                                </View>
                                            </View>
                                        )
                                        :
                                        (
                                            <View style={[styles.messageOfOther, { marginBottom: 5 }]}>
                                                <Image source={{ uri: (users.filter((u) => u.id === item.userId))[0].avatar }} style={styles.avatar} />
                                                <View style={styles.boxMessageContent}>
                                                    <Text style={styles.textNameOthers}>{(users.filter((u) => u.id === item.userId))[0].name}</Text>
                                                    <Text style={styles.textMessage}>{item.content}</Text>
                                                    
                                                </View>
                                            </View>
                                        )
                        )}
                        // Để hiển thị tin nhắn mới nhất
                        inverted
                        ListFooterComponent={<View style={{ height: 20 }} />}
                        ListHeaderComponent={<View style={{ height: 20 }} />}
                    />
                </View>

                {/* Hộp nhập tin nhắn */}
                <View style={styles.sendMessage}>
                    <View style={styles.boxSendMessage}>
                        <Icon name="emoji" size={28} color="gray" />
                        <TextInput style={styles.textInputMessage} placeholder="Tin nhắn" value={message} onChangeText={(text) => setMessage(text)} />
                    </View>
                    {message === "" ? (
                        <View style={styles.boxFeatureSendMessage}>
                            <TouchableOpacity><Icon name="moreHorizontal" size={26} color="gray" /></TouchableOpacity>
                            <TouchableOpacity><Icon name="microOn" size={26} color="gray" /></TouchableOpacity>
                            <TouchableOpacity><Icon name="imageFile" size={26} color="gray" /></TouchableOpacity>
                        </View>
                    )
                        :
                        (
                            <View>
                                <TouchableOpacity onPress={() => sendMessage()}><Icon name="sent" size={26} color={theme.colors.primary} /></TouchableOpacity>
                            </View>
                        )
                    }
                </View>
            </View>
        </ScreenWrapper>
    )
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
        borwderWidth: 1,
        borderColor: "gray",
        maxWidth: wp(70),
    },
    messageOfOther: {
        alignSelf: "flex-start",
        borderColor: "gray",
        flexDirection: "row",
        marginHorizontal: 15,
        marginBottom: 10,
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