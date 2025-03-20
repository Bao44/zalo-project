import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { router } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { useLocalSearchParams } from "expo-router";
import { getConversationBetweenTwoUsers, createConversation1vs1 } from "../../api/conversationAPI";
import { getMessages, sendMessage } from "../../api/messageAPI";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../utils/socket";
import Loading from "../../components/Loading";
import Avatar from "../../components/Avatar";
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from "expo-media-library";
import RadioButton from "../../components/RadioButton";
import * as FileSystem from "expo-file-system";
import RenderImageMessage from "../../components/RenderImageMessage";

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
    const [photos, setPhotos] = useState([]);
    const [permission, requestPermission] = MediaLibrary.usePermissions();
    const [showGallery, setShowGallery] = useState(false);
    const [stempId, setStempId] = useState("");

    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Giảm kích thước xuống 800px chiều rộng
            { compress: 0.7, format: 'jpeg' } // Nén chất lượng 70%
        );
        return manipulatedImage.uri;
    };

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    // Tham gia room và lắng nghe tin nhắn mới
    useEffect(() => {
        if (conversation?._id) {
            socket.emit("join", conversation._id); // Tham gia room dựa trên conversationId
        }

        socket.on("newMessage", (message, tempId) => {
            if (message.conversationId === conversation?._id) {
                setMessages((prev) => {
                    const index = prev.findIndex((msg) => msg._id === tempId);
                    if (index !== -1) {
                        const updatedMessages = [...prev];
                        updatedMessages[index] = message;
                        return updatedMessages;
                    } else {
                        return [message, ...prev];
                    }
                })
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

            let images = [];
            if (attachments.length > 0) {
                images = await Promise.all(
                    attachments.map(async (attachment) => {
                        const compressedUri = await compressImage(attachment.uri);
                        const fileBase64 = await FileSystem.readAsStringAsync(compressedUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        return {
                            folderName: "messages",
                            fileUri: fileBase64,
                            isImage: true,
                        };
                    })
                );
            }

            let t = Date.now().toString();
            setStempId(t);

            const messageData = {
                idTemp: t,
                senderId: user.id,
                content: message,
                attachments: images,
                media,
                files,
                receiverId: parsedData._id,
            };

            // set tam tin nhan
            setMessages((prev) => [
                {
                    _id: t,
                    senderId: { _id: user.id, name: user.name, avatar: user.avatar },
                    content: message,
                    attachments: attachments.map((img) => img.uri),
                    media,
                    files,
                    createdAt: new Date().toISOString(),
                },
                ...prev,
            ]);

            setMessage("");
            setAttachments([]);
            setMedia([]);
            setFiles([]);
            setShowGallery(false);

            // Gửi tin nhắn
            const response = await sendMessage(conversationId, messageData);
            if (!response.success) {
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

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (permission.granted) {
            getPhotos();
        }
    }, [permission]);

    const getPhotos = async () => {
        let allPhotos = [];
        let hasNextPage = true;
        let after = null;

        while (hasNextPage) {
            const album = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.photo,
                first: 100, // Lấy mỗi lần 100 ảnh (tăng nếu muốn nhanh hơn)
                after: after, // Tiếp tục từ ảnh trước đó
            });

            allPhotos = [...allPhotos, ...album.assets]; // Thêm vào danh sách
            hasNextPage = album.hasNextPage; // Kiểm tra còn dữ liệu không
            after = album.endCursor; // Cập nhật con trỏ để lấy trang tiếp theo
        }

        setPhotos(allPhotos);
    };

    // Chức năng chọn ảnh
    const selectImage = (uri) => {
        if (attachments.includes(uri)) {
            setAttachments((prev) => prev.filter((img) => img.id !== uri.id));
        } else {
            setAttachments((prev) => [...prev, uri]);
        }
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
                        {type === "private" ? (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{parsedData?.name}</Text>
                            </View>
                        ) : (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{conversation.name}</Text>
                                <Text style={styles.textNumberMember}>{conversation.members?.length} thành viên</Text>
                            </View>
                        )}
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
                        loading ? (<Loading />) : messages.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text>Không có tin nhắn</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={messages}
                                keyExtractor={(item) => item?._id.toString()}
                                renderItem={({ item, index }) => (
                                    (item?.senderId._id === user?.id)
                                        ?
                                        ((index !== messages.length - 1 && item.userId === messages[index + 1].senderId._id) ?
                                            (
                                                <View style={[styles.messageOfMe, { marginTop: 5 }]}>
                                                    {item.attachments.length > 0 && (
                                                        <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                    )}
                                                    <Text style={styles.textMessage}>{item.content}</Text>
                                                    {
                                                        index === 0 ? <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                            :
                                                            (item.senderId._id === messages[index - 1].senderId._id) ? null : <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                    }
                                                </View>
                                            )
                                            :
                                            (
                                                <View style={styles.messageOfMe}>
                                                    {item.attachments.length > 0 && (
                                                        <RenderImageMessage images={item?.attachments} wh={wp(70)}/>
                                                    )}
                                                    <Text style={styles.textMessage}>{item.content}</Text>
                                                    {
                                                        index === 0 ? <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                            :
                                                            (item.senderId._id === messages[index - 1].senderId._id) ? null : <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                    }
                                                </View>
                                            ))
                                        :
                                        (index === messages.length - 1) ?
                                            (
                                                <View style={[styles.messageOfOther]}>
                                                    <Avatar uri={item.senderId.avatar} style={styles.avatar} />
                                                    <View style={styles.boxMessageContent}>
                                                        {conversation.type === "private" ? null : <Text style={styles.textNameOthers}>{item.senderId.name}</Text>}
                                                        {item.attachments.length > 0 && (
                                                            <RenderImageMessage images={item?.attachments} wh={wp(70)}/>
                                                        )}
                                                        <Text style={styles.textMessage}>{item.content}</Text>
                                                        <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                    </View>
                                                </View>
                                            )
                                            :
                                            (item.senderId._id === messages[index + 1].senderId._id) ?

                                                (
                                                    <View style={[styles.messageOfOther, { marginTop: 5 }]}>
                                                        <Image style={styles.avatar} />
                                                        <View style={styles.boxMessageContent}>
                                                            {item.attachments.length > 0 && (
                                                                <RenderImageMessage images={item?.attachments} wh={wp(70)}/>
                                                            )}
                                                            <Text style={styles.textMessage}>{item.content}</Text>
                                                            {(index === messages.length - 1) ?
                                                                ((item.senderId._id === messages[index - 1].senderId._id) ? null : <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>)
                                                                :
                                                                (index === 0) ? <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                                    :
                                                                    ((item.senderId._id === messages[index - 1].senderId._id) ? null : <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>)
                                                            }
                                                        </View>
                                                    </View>
                                                )
                                                :
                                                (
                                                    <View style={[styles.messageOfOther]}>
                                                        <Avatar uri={item.senderId.avatar} style={styles.avatar} />
                                                        <View style={styles.boxMessageContent}>
                                                            {conversation.type === "private" ? null : <Text style={styles.textNameOthers}>{item.senderId.name}</Text>}
                                                            {item.attachments.length > 0 && (
                                                                <RenderImageMessage images={item?.attachments} wh={wp(70)}/>
                                                            )}
                                                            <Text style={styles.textMessage}>{item.content}</Text>
                                                            {(index === messages.length - 1) ?
                                                                ((item.senderId._id === messages[index - 1].senderId._id) ? null : <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>)
                                                                :
                                                                (index === 0) ? <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>
                                                                    :
                                                                    ((item.senderId._id === messages[index - 1].senderId._id) ? null : <Text style={styles.textTime}>{formatTime(item.createdAt)}</Text>)
                                                            }
                                                        </View>
                                                    </View>
                                                )
                                )}
                                // Để hiển thị tin nhắn mới nhất
                                inverted
                                ListFooterComponent={<View style={{ height: 20 }} />}
                                ListHeaderComponent={<View style={{ height: 20 }} />}
                            />
                        )
                    }
                </View>
                <View style={styles.inputContainer}>
                    {/* Hộp nhập tin nhắn */}
                    <View style={styles.sendMessage}>
                        <View style={styles.boxSendMessage}>
                            <Icon name="emoji" size={28} color="gray" />
                            <TextInput style={styles.textInputMessage} placeholder="Tin nhắn" value={message} onChangeText={(text) => setMessage(text)} />
                        </View>
                        {message === "" && attachments.length === 0 ? (
                            <View style={styles.boxFeatureSendMessage}>
                                <TouchableOpacity><Icon name="moreHorizontal" size={26} color="gray" /></TouchableOpacity>
                                <TouchableOpacity><Icon name="microOn" size={26} color="gray" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowGallery(!showGallery)}><Icon name="imageFile" size={26} color="gray" /></TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleSendMessage}>
                                <Icon name="sent" size={26} color={theme.colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Hiển thị thư viện ảnh phía dưới ô nhập tin nhắn */}
                    {showGallery && (
                        <View style={styles.galleryContainer}>
                            <FlatList
                                data={photos}
                                numColumns={3}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => selectImage(item)} style={{ position: "relative" }}>
                                        <View style={{ position: "absolute", top: 7, right: 7, zIndex: 50 }}>
                                            <RadioButton isSelect={attachments.includes(item)} size={20} color={theme.colors.primary} onPress={() => selectImage(item)} />
                                        </View>
                                        <Image source={{ uri: item.uri }} style={styles.galleryImage} />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
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
        // marginBottom: hp(6), // Đẩy nội dung lên trên sendMessage
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
        maxWidth: wp(80),
        minWidth: wp(15),
        minHeight: hp(5),
    },
    messageOfOther: {
        alignSelf: "flex-start",
        borderColor: "gray",
        flexDirection: "row",
        marginHorizontal: 15,
        marginTop: 10,
        minWidth: wp(15),
        minHeight: hp(5),
    },
    boxMessageContent: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: wp(75),
        marginLeft: 10,
        borderColor: theme.colors.darkLight,
        borderWidth: 0.5,
        minWidth: wp(15),
        minHeight: hp(5),
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

    // Gallery
    inputContainer: {
        width: "100%",
    },
    galleryContainer: {
        backgroundColor: "#FFF",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        maxHeight: hp(35),
        minHeight: hp(35), // Giới hạn chiều cao
        alignItems: "center",
        position: "relative"
    },
    galleryImage: {
        width: wp(30),
        height: hp(15),
        margin: 2,
        borderRadius: 10,
    },
    selectImage: {
        position: "absolute",
        top: 5,
        right: 5,
    },
});