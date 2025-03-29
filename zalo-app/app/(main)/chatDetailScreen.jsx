import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Keyboard } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { router } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { useLocalSearchParams } from "expo-router";
import { getConversationBetweenTwoUsers, createConversation1vs1, getConversationsGroup, getConversation } from "../../api/conversationAPI";
import { getMessages, sendMessage } from "../../api/messageAPI";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../utils/socket";
import Loading from "../../components/Loading";
import Avatar from "../../components/Avatar";
import * as ImageManipulator from 'expo-image-manipulator';
import RadioButton from "../../components/RadioButton";
import * as FileSystem from "expo-file-system";
import RenderImageMessage from "../../components/RenderImageMessage";
import * as MediaLibrary from "expo-media-library";
import * as DocumentPicker from 'expo-document-picker';
import wordImage from "../../assets/images/iconFiles/6296672_microsoft_office_office365_powerpoint_icon.png"
import ViewFile from "../../components/ViewFile";

const ChatDetailScreen = () => {
    const { user } = useAuth();
    const { type, data, converId } = useLocalSearchParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [media, setMedia] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [stempId, setStempId] = useState("");
    const [option, setOption] = useState("emoji");

    // LẤY ẢNH TỪ THƯ VIỆN
    useEffect(() => {
        const getPhotos = async () => {
            // Kiểm tra quyền
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Quyền truy cập thư viện ảnh", "Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh.");
                return;
            } else {
                console.log("🔓 Permission granted");
            }

            let allPhotos = [];
            let hasNextPage = true;
            let after = null;

            while (hasNextPage) {
                const photos = await MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.photo,
                    first: 50,
                    after: after,
                });
                if (photos.assets.length === 0) {
                    console.warn("⚠️ Không tìm thấy ảnh nào trong thư viện.");
                }

                allPhotos = [...allPhotos, ...photos.assets];
                hasNextPage = photos.hasNextPage;
                after = photos.endCursor;
            }
            setPhotos(allPhotos);
        };

        getPhotos();
    }, []);

    // NÉN ẢNH TRƯỚC KHI GỬI
    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Giảm kích thước xuống 800px chiều rộng
            { compress: 0.7, format: 'jpeg' } // Nén chất lượng 70%
        );
        return manipulatedImage.uri;
    };

    // PARSE DATA
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    // JOIN ROOM
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

    // LẤY CUỘC TRÒ CHUYỆN
    useEffect(() => {
        const fetchConversation = async () => {
            try {
                if (type === "private") {
                    if (!user?.id || !parsedData?._id) return;
                    const response = await getConversationBetweenTwoUsers(user?.id, parsedData?._id);
                    if (response.success && response.data) {
                        setConversation(response.data);
                        const messagesResponse = await getMessages(response.data?._id);
                        if (messagesResponse.success) {
                            setMessages(messagesResponse.data);
                        }
                    } else if (response.status === 404) {
                        setConversation(null);
                    }
                } else {
                    if (!user?.id || !converId) return;
                    const response = await getConversation(converId);
                    if (response.success && response.data) {
                        setConversation(response.data);
                        const messagesResponse = await getMessages(response.data._id);
                        if (messagesResponse.success) {
                            setMessages(messagesResponse.data);
                        }
                    } else if (response.status === 404) {
                        setConversation(null);
                    }
                }
            } catch (error) {
                console.log("Lỗi lấy cuộc trò chuyện:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversation();
    }, [user?.id, parsedData?._id]);

    // GỬI TIN NHẮN
    const handleSendMessage = async () => {
        if (!message && attachments.length === 0 && media.length === 0 && files.length === 0) {
            return;
        }
        try {
            if (!converId) {
                if (!user?.id || !parsedData?._id) {
                    Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                    return;
                }
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
                receiverId: parsedData?._id,
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

    // FORMAT THỜI GIAN
    const formatTime = (timestamp) => {
        const date = timestamp && new Date(timestamp);
        return date ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}` : "";
    };


    // CHỌN ẢNH
    const selectImage = (uri) => {
        if (attachments.includes(uri)) {
            setAttachments((prev) => prev.filter((img) => img.id !== uri.id));
        } else {
            setAttachments((prev) => [...prev, uri]);
        }
    };

    // ẨN BÀN PHÍM KHI MỞ THƯ VIỆN ẢNH
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            if (showGallery) {
                setShowGallery(false); // Đóng thư viện ảnh khi bàn phím mở
            }
        });

        // Dọn dẹp listener khi component unmount
        return () => {
            keyboardDidShowListener.remove();
        };
    }, [showGallery]);


    // MỞ CHỨC NĂNG MƠ RỘNG
    const toggleGallery = (ot) => {
        setOption(ot);
        if (option === "" || ot === option) {
            setShowGallery((prev) => {
                const newValue = !prev;
                if (newValue) {
                    Keyboard.dismiss(); // Ẩn bàn phím khi mở thư viện ảnh
                }
                return newValue;
            });
        } else {
            setShowGallery(true);
            Keyboard.dismiss();
        }
    };

    // LẤY TÀI LIỆU TỪ MÁY
    const handlePickFile = async () => {
        try {
            // Check permissions (optional, as Expo handles this implicitly on Android)
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Quyền truy cập tài liệu',
                    'Vui lòng cấp quyền truy cập tài liệu để chọn tài liệu.'
                );
                return;
            } else {
                console.log('Permission granted');
            }

            const result = await DocumentPicker.getDocumentAsync(
                {
                    type: [
                        'application/pdf', // PDF
                        'application/msword', // Word (.doc)
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
                        'application/vnd.ms-excel', // Excel (.xls)
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
                        'application/vnd.ms-project', // Microsoft Project (.mpp)
                        'text/plain', // File văn bản (.txt)
                        'application/vnd.ms-powerpoint', // PowerPoint (.ppt)
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint (.pptx)
                        'application/vnd.ms-outlook', // Outlook (.msg)
                        'application/rtf', // Rich Text Format (.rtf)
                        'application/vnd.oasis.opendocument.text', // Open Document Text (.odt)
                        'application/vnd.oasis.opendocument.spreadsheet', // Open Document Spreadsheet (.ods)
                        'application/vnd.oasis.opendocument.presentation', // Open Document Presentation (.odp)
                        'application/zip', // ZIP (.zip)
                        'application/x-rar-compressed', // RAR (.rar)
                        'application/vnd.rar', // RAR (.rar)
                        'text/plain', // File văn bản (.txt)
                        'text/comma-separated-values', // CSV (.csv)
                        'application/vnd.android.package-archive', // APK (.apk)
                        'java/*', // Java (.java)
                        'text/css', // CSS (.css)
                        'text/html', // HTML (.html)
                        'application/json', // JSON (.json)
                        'application/xml', // XML (.xml)
                        'text/xml', // XML (.xml
                    ],
                    multiple: true,
                }
            );
            if (!result.canceled) {
                result.assets.map(async (file) => {
                    const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setFiles((prev) => [...prev, { uri: fileBase64, name: file.name, type: file.mimeType }]);
                }
                );
            } else {
                console.log("Cancel");
            }
        } catch (error) {
            console.error('Error in handlePickFile:', error);
            Alert.alert(
                'Lỗi',
                'Không thể chọn tài liệu từ máy: ' + (error.message || 'Lỗi không xác định')
            );
        }
    };

    // 
    if (files.length > 0 && message === "" && attachments.length === 0 && media.length === 0) {
        handleSendMessage();
    }


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
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{conversation?.name}</Text>
                                <Text style={styles.textNumberMember}>{conversation?.members.length} thành viên</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.boxFeatureHeader}>
                        {type === "private" && <TouchableOpacity><Icon name="phone" size={26} color="#FFF" /></TouchableOpacity>}
                        <TouchableOpacity><Icon name="callVideoOn" size={26} color="#FFF" /></TouchableOpacity>
                        {type === "group" && <TouchableOpacity><Icon name="search" size={26} color="#FFF" /></TouchableOpacity>}
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
                                                    {item.files.length > 0 && (
                                                        <ViewFile file={item.files[0]} />
                                                    )}
                                                    {item.content && <Text style={styles.textMessage}>{item.content}</Text>}
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
                                                        <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                    )}
                                                    {item.files.length > 0 && (
                                                        <ViewFile file={item.files[0]} />
                                                    )}
                                                   {item.content && <Text style={styles.textMessage}>{item.content}</Text>}
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
                                                            <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                        )}
                                                        {item.files.length > 0 && (
                                                            <ViewFile file={item.files[0]} />
                                                        )}
                                                        {item.content && <Text style={styles.textMessage}>{item.content}</Text>}
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
                                                                <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                            )}
                                                            {item.files.length > 0 && (
                                                                <ViewFile file={item.files[0]} />
                                                            )}
                                                            {item.content && <Text style={styles.textMessage}>{item.content}</Text>}
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
                                                                <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                            )}
                                                            {item.files.length > 0 && (
                                                                <ViewFile file={item.files[0]} />
                                                            )}
                                                            {item.content && <Text style={styles.textMessage}>{item.content}</Text>}
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
                            <TouchableOpacity onPress={() => toggleGallery("emoji")}>
                                <Icon name="emoji" size={28} color="gray" />
                            </TouchableOpacity>
                            <TextInput style={styles.textInputMessage} placeholder="Tin nhắn" value={message} onChangeText={(text) => setMessage(text)} />
                        </View>
                        {message === "" && attachments.length === 0 ? (
                            <View style={styles.boxFeatureSendMessage}>
                                <TouchableOpacity onPress={() => toggleGallery("extend")}><Icon name="moreHorizontal" size={26} color="gray" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleGallery("")}><Icon name="microOn" size={26} color="gray" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleGallery("image")}><Icon name="imageFile" size={26} color="gray" /></TouchableOpacity>
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
                            {option === "emoji" ?
                                (<Image source={{ uri: wordImage.src }} style={{ width: 20, height: 20 }} />)
                                :
                                option === "image" ?
                                    (
                                        <FlatList
                                            data={photos}
                                            numColumns={3}
                                            keyExtractor={(item) => item.uri}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity onPress={() => selectImage(item)} style={{ position: "relative" }}>
                                                    <View style={{ position: "absolute", top: 7, right: 7, zIndex: 50 }}>
                                                        <RadioButton isSelect={attachments.includes(item)} size={20} color={theme.colors.primary} onPress={() => selectImage(item)} />
                                                    </View>
                                                    <Image source={{ uri: item.uri }} style={styles.galleryImage} />
                                                </TouchableOpacity>
                                            )}
                                        />
                                    )
                                    :
                                    option === "extend" ?
                                        (
                                            <View style={{ flexDirection: "row", justifyContent: "space-around", height: "100%" }}>
                                                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", width: "100%", height: "30%", paddingHorizontal: 20 }}>
                                                    <TouchableOpacity style={styles.buttonExtend}>
                                                        <View style={[styles.boxIcon, { backgroundColor: "#FFC107" }]}>
                                                            <Icon name="location" size={26} color="#fff" />
                                                        </View>
                                                        <Text>Vị trí</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.buttonExtend} onPress={handlePickFile}>
                                                        <View style={[styles.boxIcon, { backgroundColor: "#FF5722" }]}>
                                                            <Icon name="attach" size={26} color="#fff" />
                                                        </View>
                                                        <Text>Tài liệu</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.buttonExtend}>
                                                        <View style={[styles.boxIcon, { backgroundColor: "#4CAF50" }]}>
                                                            <Icon name="audio" size={26} color="#fff" />
                                                        </View>
                                                        <Text>Audio</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.buttonExtend}>
                                                        <View style={[styles.boxIcon, { backgroundColor: "#2196F3" }]}>
                                                            <Icon name="bussinessCard" size={26} color="#fff" />
                                                        </View>
                                                        <Text>Danh thiếp</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )
                                        :
                                        (
                                            <Text>Audio</Text>
                                        )
                            }
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

    //
    boxIcon: {
        width: 50,
        height: 50,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonExtend: {
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "20%",
        height: "100%",
    }
});