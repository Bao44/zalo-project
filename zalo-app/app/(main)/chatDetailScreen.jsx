import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Keyboard, InteractionManager, Linking } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { router } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { useLocalSearchParams } from "expo-router";
import { getConversationBetweenTwoUsers, createConversation1vs1, getConversation } from "../../api/conversationAPI";
import { getMessages, sendMessage, addUserSeen, deleteMessage, undoDeleteMessage, likeMessage } from "../../api/messageAPI";
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
import ViewFile from "../../components/ViewFile";
import EmojiPicker from "../../components/EmojiPicker";
import MessageOptionsModal from "@/components/MessageOptionsModal";
import { useIsFocused } from '@react-navigation/native';
import { debounce } from "lodash";
import { Video } from "expo-av";
import AudioCart from "@/components/AudioCart";
import AudioPlayer from "@/components/AudioPlayer";
import ReplytoMessageSelected from "@/components/ReplytoMessageSelected";
import AttachReplytoMessage from "@/components/AttachReplytoMessage";
import ParsedText from "react-native-parsed-text";


const ChatDetailScreen = () => {
    const { user } = useAuth();
    const { type, data, convertId } = useLocalSearchParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [stempId, setStempId] = useState("");
    const [option, setOption] = useState("emoji");
    const [messageReplyto, setMessageReplyto] = useState(null);
    const [highlightMessageReplyto, setHighlightMessageReplyto] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const isFocused = useIsFocused();
    const videoRef = useRef(null);
    const inputRef = useRef(null);
    const flatListRef = useRef(null);

    const getMimeTypeFromFilename = (filename) => {
        const extension = filename?.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "heic":
                return "image/heic";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream"; // fallback
        }
    };

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

                const detailedPhotos = photos.assets.map((asset) => ({
                    ...asset,
                    mimeType: getMimeTypeFromFilename(asset.filename),
                }));

                allPhotos = [...allPhotos, ...detailedPhotos];
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

    // JOIN ROOM SOCKET
    useEffect(() => {
        if (conversation?._id) {
            socket.emit("join", conversation._id); // Tham gia room dựa trên conversationId
        }

        // Lắng nghe sự kiện newMessage
        socket.on("newMessage", (message, tempId) => {
            if (message.conversationId === conversation?._id) {
                setMessages((prev) => {
                    const index = prev.findIndex((msg) => msg._id === tempId || msg._id === message._id);
                    if (index !== -1) {
                        // Thay thế tin nhắn tạm hoặc tin nhắn trùng
                        const updatedMessages = [...prev];
                        updatedMessages[index] = message;
                        return updatedMessages;
                    } else {
                        // Thêm tin nhắn mới
                        return [message, ...prev];
                    }
                });

                if (message.senderId !== user?.id && isFocused) {
                    addUserSeen(message.conversationId, user?.id);
                }
            }
        });

        // Lắng nghe sự kiện messageSeen với nhiều tin nhắn
        socket.on("messageSeen", ({ conversationId, userId, updatedMessageIds, updatedCount }) => {
            if (conversationId === conversation?._id && userId !== user?.id) {
                setMessages((prev) =>
                    prev.map((msg) => {
                        // Chỉ cập nhật những tin nhắn có trong updatedMessageIds
                        if (updatedMessageIds.includes(msg._id.toString()) && !msg.seen.includes(userId)) {
                            return { ...msg, seen: [...msg.seen, userId] };
                        }
                        return msg;
                    })
                );
            }
        });

        // Lắng nghe sự kiện messageRevoked
        socket.on("messageRevoked", ({ conversationId, messageId, userId }) => {
            if (conversationId === conversation?._id) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id.toString() === messageId ? { ...msg, revoked: true } : msg
                    )
                );
                console.log(`Tin nhắn ${messageId} đã được thu hồi bởi ${userId}`);
            }
        });

        // Lắng nghe sự kiện messageLiked
        socket.on("messageLiked", ({ savedMessage, senderUserLike, updatedAt }) => {
            if (savedMessage.conversationId === conversation?._id) {
                setMessages((prev) =>
                    prev.map((msg) => {
                        if (msg._id.toString() === savedMessage._id.toString()) {
                            const currentUpdatedAt = msg.updatedAt || msg.createdAt;
                            if (!currentUpdatedAt || new Date(updatedAt) >= new Date(currentUpdatedAt)) {
                                return { ...msg, like: savedMessage.like, updatedAt };
                            }
                        }
                        return msg;
                    })
                );
            }
        });

        return () => {
            socket.off("newMessage");
            socket.off("messageSeen");
            socket.off("messageRevoked");
            socket.off("messageLiked");
            if (conversation?._id) {
                socket.emit("leave", conversation._id); // Rời room khi thoát
            }
        };
    }, [conversation?._id, user?.id, isFocused]);

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
                            const deleteHistory = response.data.delete_history.find((entry) => entry.userId === user?.id);
                            if (deleteHistory) {
                                setMessages(messagesResponse.data.filter((msg) => new Date(msg.createdAt) > new Date(deleteHistory.time_delete)));
                            } else {
                                setMessages(messagesResponse.data);
                            }
                            // Cập nhật trạng thái đã xem cho người dùng
                            await addUserSeen(response.data._id, user?.id);
                        }
                    } else if (response.status === 404) {
                        setConversation(null);
                    }
                } else {
                    if (!user?.id || !convertId) return;
                    const response = await getConversation(convertId);
                    if (response.success && response.data) {
                        setConversation(response.data);
                        const messagesResponse = await getMessages(response.data._id);
                        if (messagesResponse.success) {
                            setMessages(messagesResponse.data);
                            // Cập nhật trạng thái đã xem cho người dùng
                            await addUserSeen(response.data._id, user?.id);
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
        if (!message && attachments?.length === 0) {
            return;
        }
        try {
            let conversationId = conversation?._id;

            if (!conversation) {
                if (!user?.id || !parsedData?._id) {
                    Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                    return;
                }
                const response = await createConversation1vs1(user?.id, parsedData?._id);
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

            // Xử lý ảnh đính kèm (nếu có)
            let images = [];
            if (attachments?.length > 0) {
                images = await Promise.all(
                    attachments.map(async (attachment) => {
                        const compressedUri = await compressImage(attachment.uri);
                        return {
                            uri: compressedUri,
                            name: attachment.filename,
                            type: attachment.mimeType,
                        };
                    })
                );
            }

            const t = Date.now().toString();
            setStempId(t);

            const messageData = new FormData();
            messageData.append("idTemp", t);
            messageData.append("senderId", user?.id);
            messageData.append("content", message || "");
            messageData.append("receiverId", parsedData?._id);
            messageData.append("conversationId", conversationId);

            // Thêm tin nhắn tạm thời vào danh sách
            setMessages((prev) => [
                {
                    _id: t,
                    senderId: { _id: user?.id, name: user?.name, avatar: user?.avatar },
                    content: message || "",
                    attachments: attachments.map((img) => img.uri),
                    media: null,
                    files: null,
                    replyTo: messageReplyto || null,
                    createdAt: new Date().toISOString(),
                },
                ...prev,
            ]);

            // Reset trạng thái
            setMessage("");
            setAttachments([]);
            setMessageReplyto(null);
            setShowGallery(false);

            // Gửi tin nhắn
            const response = await sendMessage(messageData);
            if (response.success && response.data) {
                // Cập nhật tin nhắn tạm với ID chính thức từ server
                setMessages((prev) => {
                    const index = prev.findIndex((msg) => msg._id === t);
                    if (index !== -1) {
                        const updatedMessages = [...prev];
                        updatedMessages[index] = {
                            ...updatedMessages[index],
                            _id: response.data._id, // Thay thế idTemp bằng ID chính thức
                            ...response.data, // Cập nhật các trường khác từ server
                        };
                        return updatedMessages;
                    }
                    return prev;
                });
            } else {
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
                const selectedFiles = await Promise.all(
                    result.assets.map(async (file) => {
                        return {
                            uri: file.uri,
                            name: file.name,
                            type: file.mimeType,
                        };
                    })
                );

                // Gửi từng file ngay sau khi chọn
                for (const file of selectedFiles) {
                    let conversationId = conversation?._id;

                    // Tạo cuộc trò chuyện nếu chưa có
                    if (!conversation) {
                        if (!user?.id || !parsedData?._id) {
                            Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                            return;
                        }
                        const response = await createConversation1vs1(user?.id, parsedData?._id);
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

                    const t = Date.now().toString();
                    setStempId(t);

                    const messageData = new FormData();
                    messageData.append("idTemp", t);
                    messageData.append("senderId", user?.id);
                    messageData.append("file", {
                        uri: file.uri,
                        name: file.name,
                        type: file.type,
                    });
                    messageData.append("receiverId", parsedData?._id);
                    messageData.append("conversationId", conversationId);

                    console.log("DDDĐ", messageData._parts);

                    // Thêm tin nhắn tạm thời vào danh sách
                    setMessages((prev) => [
                        {
                            _id: t,
                            senderId: { _id: user?.id, name: user?.name, avatar: user?.avatar },
                            content: "",
                            attachments: [],
                            media: null,
                            files: file, // Đồng bộ với tên biến trong API
                            createdAt: new Date().toISOString(),
                        },
                        ...prev,
                    ]);

                    // Gửi tin nhắn qua API
                    const response = await sendMessage(messageData);
                    if (!response.success) {
                        Alert.alert("Lỗi", `Không thể gửi tin nhắn: ${response.data?.message || "Lỗi không xác định"}`);
                    }
                }

                // Reset trạng thái files sau khi gửi
                setShowGallery(false);
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

    // GỬI VIDEO
    const handlePickVideo = async () => {
        try {
            // Kiểm tra quyền truy cập thư viện video
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Quyền truy cập video", "Vui lòng cấp quyền truy cập video để chọn video.");
                return;
            }

            // Chọn video từ thư viện
            const result = await DocumentPicker.getDocumentAsync({
                type: ["video/*"], // Chỉ chọn các file video
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.length > 0) {
                const maxSizeMB = 50; // Giới hạn kích thước tối đa (50MB)
                const maxSizeBytes = maxSizeMB * 1024 * 1024; // Chuyển đổi sang bytes

                const selectedVideos = await Promise.all(
                    result.assets.map(async (video) => {
                        // Kiểm tra kích thước file
                        const fileInfo = await FileSystem.getInfoAsync(video.uri);
                        if (fileInfo.size > maxSizeBytes) {
                            throw new Error(`Video "${video.name}" vượt quá giới hạn ${maxSizeMB}MB.`);
                        }
                        return {
                            uri: video.uri,
                            name: video.name,
                            type: video.mimeType,
                        };
                    })
                );

                // Gửi từng video ngay sau khi chọn
                for (const video of selectedVideos) {
                    let conversationId = conversation?._id;

                    // Tạo cuộc trò chuyện nếu chưa có
                    if (!conversation) {
                        if (!user?.id || !parsedData?._id) {
                            Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                            return;
                        }
                        const response = await createConversation1vs1(user?.id, parsedData?._id);
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

                    const t = Date.now().toString();
                    setStempId(t);

                    const messageData = new FormData();
                    messageData.append("idTemp", t);
                    messageData.append("senderId", user?.id);
                    messageData.append("content", "");
                    messageData.append("attachments", null);
                    messageData.append("media", video); // Gửi video
                    messageData.append("file", null);
                    messageData.append("receiverId", parsedData?._id);
                    messageData.append("conversationId", conversationId);

                    // Thêm tin nhắn tạm thời vào danh sách
                    setMessages((prev) => [
                        {
                            _id: t,
                            senderId: { _id: user?.id, name: user?.name, avatar: user?.avatar },
                            content: "",
                            attachments: [],
                            media: video, // Đồng bộ với tên biến trong API
                            files: null,
                            createdAt: new Date().toISOString(),
                        },
                        ...prev,
                    ]);

                    // Gửi tin nhắn qua API
                    const response = await sendMessage(messageData);
                    if (!response.success) {
                        Alert.alert("Lỗi", `Không thể gửi video: ${response.data?.message || "Lỗi không xác định"}`);
                        // Xóa tin nhắn tạm nếu gửi thất bại
                        setMessages((prev) => prev.filter((msg) => msg._id !== t));
                    }
                }

                // Reset trạng thái sau khi gửi
                setShowGallery(false);
            } else {
                console.log("Video selection canceled");
            }
        } catch (error) {
            console.error("Error in handlePickVideo:", error);
            Alert.alert("Lỗi", error.message || "Không thể gửi video: Lỗi không xác định");
        }
    };

    // THÍCH TIN NHẮN
    const handleLike = debounce(async (messageId, statusLike, userId) => {
        try {
            const response = await likeMessage(messageId, statusLike, userId);
            if (response) {
                setMessages((prev) =>
                    prev.map((msg) => {
                        if (msg._id === messageId) {
                            // Chỉ cập nhật dựa trên dữ liệu từ server
                            return { ...msg, like: response.data.like };
                        }
                        return msg;
                    })
                );
            } else {
                Alert.alert("Lỗi", "Không thể thích tin nhắn này");
            }
        } catch (error) {
            console.error("Error liking message:", error);
            Alert.alert("Lỗi", "Không thể thích tin nhắn này");
        }
    }, 300);

    // MODAL TÙY CHỌN TIN NHẮN
    const handleLongPress = (message) => {
        setSelectedMessage(message);
        setModalVisible(true);
    };

    // TRẢ LỜI TIN NHẮN
    const handleReply = () => {
        setModalVisible(false);
        // Add your reply logic here
        setMessageReplyto(selectedMessage);
        InteractionManager.runAfterInteractions(() => {
            inputRef.current?.focus();
        });
    };

    // CHUYỂN TIẾP TIN NHẮN
    const handleForward = () => {
        setModalVisible(false);
        router.push({
            pathname: "forwardMessage",
            params: {
                messageForward: JSON.stringify(selectedMessage), // Chuyển tin nhắn thành chuỗi JSON
            },
        });
    };

    // XÓA TIN NHẮN
    const handleDelete = () => {
        setModalVisible(false); // Đóng modal ngay khi nhấn "Xóa"
        Alert.alert("Xóa tin nhắn", "Bạn có chắc chắn muốn xóa tin nhắn này không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                onPress: async () => {
                    if (!selectedMessage?._id || !user?.id) {
                        Alert.alert("Lỗi", "Không thể xác định tin nhắn hoặc người dùng");
                        return;
                    }

                    try {
                        const response = await deleteMessage(selectedMessage._id, user.id);
                        // Backend trả về status 200 khi thành công
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg._id === selectedMessage._id
                                    ? { ...msg, removed: [...(msg.removed || []), user.id] }
                                    : msg
                            )
                        );
                    } catch (error) {
                        console.error("Lỗi khi xóa tin nhắn:", error);
                        if (error.response?.status === 404) {
                            Alert.alert("Lỗi", "Tin nhắn không tồn tại");
                        } else if (error.response?.status === 400) {
                            Alert.alert("Lỗi", error.response.data.error || "Yêu cầu không hợp lệ");
                        } else {
                            Alert.alert("Lỗi", "Không thể xóa tin nhắn, vui lòng thử lại");
                        }
                    }
                },
            },
        ]);
    };

    // THU HỒI TIN NHẮN
    const handleRecall = () => {
        // Xử lý thu hồi tin nhắn ở đây
        setModalVisible(false);
        Alert.alert("Thu hồi tin nhắn", "Bạn có chắc chắn muốn thu hồi tin nhắn này không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Thu hồi",
                onPress: async () => {
                    if (!selectedMessage?._id || !user?.id) {
                        Alert.alert("Lỗi", "Không thể xác định tin nhắn hoặc người dùng");
                        return;
                    }

                    try {
                        const response = await undoDeleteMessage(selectedMessage._id, user.id);
                        // Backend trả về status 200 khi thành công
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg._id === selectedMessage._id
                                    ? { ...msg, revoked: true }
                                    : msg
                            )
                        );
                    } catch (error) {
                        console.error("Lỗi khi thu hồi tin nhắn:", error);
                        if (error.response?.status === 404) {
                            Alert.alert("Lỗi", "Tin nhắn không tồn tại");
                        } else if (error.response?.status === 400) {
                            Alert.alert("Lỗi", error.response.data.error || "Yêu cầu không hợp lệ");
                        } else {
                            Alert.alert("Lỗi", "Không thể thu hồi tin nhắn, vui lòng thử lại");
                        }
                    }
                },
            },
        ]);
    };

    // ĐĂT LAI THỜI GIAN PHÁT CHO VIDEO
    const handlePlaybackStatusUpdate = async (status) => {
        if (status.didJustFinish) {
            await videoRef.current?.setPositionAsync(0);   // tua về đầu
            await videoRef.current?.pauseAsync();          // dừng phát
        }
    };

    // FOCUS ĐẾN TIN NHẮN REPLY
    const scrollToReplyMessage = (replyToId) => {
        const replyIndex = messages.findIndex((msg) => msg._id === replyToId);
        if (replyIndex !== -1 && flatListRef.current) {
            try {
                setHighlightMessageReplyto(replyToId); // Highlight tin nhắn
                flatListRef.current.scrollToIndex({
                    index: replyIndex,
                    animated: true,
                    viewPosition: 0.5,
                });
            } catch (error) {
                console.warn("Lỗi khi cuộn tới tin nhắn:", error);
                flatListRef.current.scrollToOffset({
                    offset: replyIndex * 100,
                    animated: true,
                });
            }
        } else {
            console.warn("Không tìm thấy tin nhắn replyTo hoặc FlatList chưa sẵn sàng");
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.inFoHeader}>
                        <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={() => { Keyboard.dismiss(); router.push("home") }}>
                            <Icon name="arrowLeft" size={28} strokeWidth={1.6} color={theme.colors.darkLight} />
                        </TouchableOpacity>
                        {type === "private" ? (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{parsedData?.name}</Text>
                            </View>
                        ) : (
                            <View style={styles.boxInfoConversation}>
                                <Text style={styles.textNameConversation} numberOfLines={1} ellipsizeMode="tail">{conversation?.name}</Text>
                                <Text style={styles.textNumberMember}>{conversation?.members?.length} thành viên</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.boxFeatureHeader}>
                        {type === "private" && <TouchableOpacity><Icon name="phone" size={26} color="#FFF" /></TouchableOpacity>}
                        <TouchableOpacity><Icon name="callVideoOn" size={26} color="#FFF" /></TouchableOpacity>
                        {type === "group" && <TouchableOpacity><Icon name="search" size={26} color="#FFF" /></TouchableOpacity>}
                        <TouchableOpacity onPress={() => router.push({ pathname: "/infoChat1vs1", params: { conversationId: conversation?._id, friend: JSON.stringify(parsedData) } })}><Icon name="menu" size={26} color="#FFF" /></TouchableOpacity>
                    </View>
                </View>

                {/* Nội dung chat */}
                <View style={styles.contentChat}>
                    {
                        loading ? (<Loading />) : messages?.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ textAlign: "center" }}>Bạn hãy là người đầu tiên mở đầu cho cuộc trò chuyện này!</Text>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item?._id?.toString()}
                                renderItem={({ item, index }) => (
                                    (item?.senderId?._id === user?.id)
                                        ?
                                        ((index !== messages?.length - 1 && item?.senderId?._id === messages[index + 1]?.senderId?._id) ?
                                            (
                                                item?.removed?.includes(user?.id) ? null : (
                                                    item?.revoked ? (
                                                        <TouchableOpacity
                                                            onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                            onLongPress={() => handleLongPress(item)}
                                                            style={[
                                                                styles.messageOfMe,
                                                                { marginTop: 5, marginBottom: item?.like?.length > 0 ? 10 : 0 },
                                                                highlightMessageReplyto === item?._id && styles.highlightReplyMessage
                                                            ]}
                                                        >
                                                            <Text style={{ fontStyle: "italic", color: 'gray' }}>Tin nhắn đã bị thu hồi</Text>
                                                            {
                                                                index === 0 ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                    :
                                                                    (item?.senderId?._id === messages[index - 1]?.senderId?._id) && !(messages[index - 1]?.removed?.includes(item?.senderId?._id)) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                            }
                                                            {
                                                                index === 0 && (
                                                                    (item?.seen?.length > 0) ? (
                                                                        <View style={styles.boxSeen}>
                                                                            <FlatList
                                                                                data={item?.seen}
                                                                                keyExtractor={(item) => item.toString()}
                                                                                renderItem={({ item }) => <Avatar uri={conversation?.members.find((i) => i._id === item)?.avatar} size={wp(4)} />}
                                                                                horizontal
                                                                                showsHorizontalScrollIndicator={false}
                                                                            />
                                                                        </View>
                                                                    ) : (
                                                                        <View style={styles.boxSeen}>
                                                                            <Text style={{ fontSize: 12 }}>Đã nhận</Text>
                                                                        </View>
                                                                    )
                                                                )
                                                            }
                                                            {
                                                                (index === 0 || item?.like?.length > 0) && (
                                                                    <View style={styles.boxLike}>
                                                                        {
                                                                            item?.like?.length > 0 ? (
                                                                                <TouchableOpacity style={styles.boxTotalLike}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                    <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                </TouchableOpacity>) : null
                                                                        }
                                                                        <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                            <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )
                                                            }
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <TouchableOpacity
                                                            onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                            onLongPress={() => handleLongPress(item)}
                                                            style={[
                                                                styles.messageOfMe,
                                                                { marginTop: 5, marginBottom: item?.like?.length > 0 ? 10 : 0, },
                                                                highlightMessageReplyto === item?._id && styles.highlightReplyMessage
                                                            ]}
                                                        >
                                                            {item?.attachments?.length > 0 && (
                                                                <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                            )}
                                                            {item?.files !== null && (
                                                                item?.files?.fileType === "audio/m4a" ? <View style={{ width: "90%", position: "relative" }}><AudioPlayer uri={item?.files?.fileUrl} /></View> : <ViewFile file={item?.files} />
                                                            )}
                                                            {item?.media && (
                                                                <Video
                                                                    ref={videoRef}
                                                                    style={{ width: wp(73), height: hp(20) }}
                                                                    source={{ uri: item?.media?.fileUrl }}
                                                                    useNativeControls
                                                                    resizeMode="contain"
                                                                    isLooping={false}
                                                                    shouldPlay={false}
                                                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                                                />
                                                            )}
                                                            {item?.content && (item?.replyTo ?
                                                                <>
                                                                    <AttachReplytoMessage message={item?.replyTo} />
                                                                    <ParsedText
                                                                        style={styles.textMessage}
                                                                        parse={[
                                                                            {
                                                                                type: "url",
                                                                                style: styles.url,
                                                                                onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {item?.content}
                                                                    </ParsedText>
                                                                </>
                                                                :
                                                                <ParsedText
                                                                    style={styles.textMessage}
                                                                    parse={[
                                                                        {
                                                                            type: "url",
                                                                            style: styles.url,
                                                                            onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                        },
                                                                    ]}
                                                                >
                                                                    {item?.content}
                                                                </ParsedText>
                                                            )}
                                                            {
                                                                index === 0 ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                    :
                                                                    (item?.senderId?._id === messages[index - 1]?.senderId?._id) && !(messages[index - 1]?.removed?.includes(item?.senderId?._id)) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                            }
                                                            {
                                                                index === 0 && (
                                                                    (item?.seen?.length > 0) ? (
                                                                        <View style={styles.boxSeen}>
                                                                            <FlatList
                                                                                data={item?.seen}
                                                                                keyExtractor={(item) => item.toString()}
                                                                                renderItem={({ item }) => <Avatar uri={conversation?.members.find((i) => i._id === item)?.avatar} size={wp(4)} />}
                                                                                horizontal
                                                                                showsHorizontalScrollIndicator={false}
                                                                            />
                                                                        </View>
                                                                    ) : (
                                                                        <View style={styles.boxSeen}>
                                                                            <Text style={{ fontSize: 12 }}>Đã nhận</Text>
                                                                        </View>
                                                                    )
                                                                )
                                                            }
                                                            {
                                                                (index === 0 || item?.like?.length > 0) && (
                                                                    <View style={styles.boxLike}>
                                                                        {
                                                                            item?.like?.length > 0 ? (
                                                                                <TouchableOpacity style={styles.boxTotalLike}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                    <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                </TouchableOpacity>) : null
                                                                        }
                                                                        <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                            <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )
                                                            }
                                                        </TouchableOpacity>
                                                    )
                                                )
                                            )
                                            :
                                            (
                                                item?.removed?.includes(user?.id) ? null : (
                                                    item?.revoked ? (
                                                        <TouchableOpacity
                                                            onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                            onLongPress={() => handleLongPress(item)}
                                                            style={[
                                                                styles.messageOfMe,
                                                                { marginBottom: item?.like?.length > 0 ? 10 : 0 },
                                                                highlightMessageReplyto === item?._id && styles.highlightReplyMessage
                                                            ]}
                                                        >
                                                            <Text style={{ fontStyle: "italic", color: 'gray' }}>Tin nhắn đã bị thu hồi</Text>
                                                            {
                                                                index === 0 ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                    :
                                                                    (item?.senderId?._id === messages[index - 1]?.senderId?._id) && !(messages[index - 1]?.removed?.includes(item?.senderId?._id)) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                            }
                                                            {
                                                                index === 0 && (
                                                                    (item?.seen?.length > 0) ? (
                                                                        <View style={styles.boxSeen}>
                                                                            <FlatList
                                                                                data={item?.seen}
                                                                                keyExtractor={(item) => item.toString()}
                                                                                renderItem={({ item }) => <Avatar uri={conversation?.members.find((i) => i._id === item)?.avatar} size={wp(4)} />}
                                                                                horizontal
                                                                                showsHorizontalScrollIndicator={false}
                                                                            />
                                                                        </View>
                                                                    ) : (
                                                                        <View style={styles.boxSeen}>
                                                                            <Text style={{ fontSize: 12 }}>Đã nhận</Text>
                                                                        </View>
                                                                    )
                                                                )
                                                            }
                                                            {
                                                                (index === 0 || item?.like?.length > 0) && (
                                                                    <View style={styles.boxLike}>
                                                                        {
                                                                            item?.like?.length > 0 ? (
                                                                                <TouchableOpacity style={styles.boxTotalLike}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                    <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                </TouchableOpacity>) : null
                                                                        }
                                                                        <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                            <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )
                                                            }
                                                        </TouchableOpacity>
                                                    ) : (
                                                        < TouchableOpacity
                                                            onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                            onLongPress={() => handleLongPress(item)}
                                                            style={[
                                                                styles.messageOfMe,
                                                                { marginBottom: item?.like?.length > 0 ? 10 : 0 },
                                                                highlightMessageReplyto === item?._id && styles.highlightReplyMessage
                                                            ]}
                                                        >
                                                            {item?.attachments?.length > 0 && (
                                                                <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                            )}
                                                            {item?.files !== null && (
                                                                item?.files?.fileType === "audio/m4a" ? <View style={{ width: "90%", position: "relative" }}><AudioPlayer uri={item?.files?.fileUrl} /></View> : <ViewFile file={item?.files} />
                                                            )}
                                                            {item?.media && (
                                                                <Video
                                                                    ref={videoRef}
                                                                    style={{ width: wp(73), height: hp(20) }}
                                                                    source={{ uri: item?.media?.fileUrl }}
                                                                    useNativeControls
                                                                    resizeMode="contain"
                                                                    isLooping={false}
                                                                    shouldPlay={false}
                                                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                                                />
                                                            )}
                                                            {item?.content && (item?.replyTo ?
                                                                <>
                                                                    <AttachReplytoMessage message={item?.replyTo} />
                                                                    <ParsedText
                                                                        style={styles.textMessage}
                                                                        parse={[
                                                                            {
                                                                                type: "url",
                                                                                style: styles.url,
                                                                                onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {item?.content}
                                                                    </ParsedText>
                                                                </>
                                                                :
                                                                <ParsedText
                                                                    style={styles.textMessage}
                                                                    parse={[
                                                                        {
                                                                            type: "url",
                                                                            style: styles.url,
                                                                            onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                        },
                                                                    ]}
                                                                >
                                                                    {item?.content}
                                                                </ParsedText>
                                                            )}
                                                            {
                                                                index === 0 ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                    :
                                                                    (item?.senderId?._id === messages[index - 1]?.senderId?._id) && !(messages[index - 1]?.removed?.includes(item?.senderId?._id)) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                            }
                                                            {
                                                                index === 0 && (
                                                                    (item?.seen?.length > 0) ? (
                                                                        <View style={styles.boxSeen}>
                                                                            <FlatList
                                                                                data={item?.seen}
                                                                                keyExtractor={(item) => item.toString()}
                                                                                renderItem={({ item }) => <Avatar uri={conversation?.members.find((i) => i._id === item)?.avatar} size={wp(4)} />}
                                                                                horizontal
                                                                                showsHorizontalScrollIndicator={false}
                                                                            />
                                                                        </View>
                                                                    ) : (
                                                                        <View style={styles.boxSeen}>
                                                                            <Text style={{ fontSize: 12 }}>Đã nhận</Text>
                                                                        </View>
                                                                    )
                                                                )
                                                            }
                                                            {
                                                                (index === 0 || item?.like?.length > 0) && (
                                                                    <View style={styles.boxLike}>
                                                                        {
                                                                            item?.like?.length > 0 ? (
                                                                                <TouchableOpacity style={styles.boxTotalLike}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                    <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                </TouchableOpacity>) : null
                                                                        }
                                                                        <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                            <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )
                                                            }
                                                        </TouchableOpacity>
                                                    )
                                                )
                                            )
                                        )
                                        :
                                        (index === messages?.length - 1) ?
                                            (
                                                item?.removed?.includes(user?.id) ? null : (
                                                    item?.revoked ? (
                                                        <TouchableOpacity
                                                            onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                            onLongPress={() => handleLongPress(item)}
                                                            style={[
                                                                styles.messageOfOther,
                                                                { marginBottom: item?.like?.length > 0 ? 10 : 0 }
                                                            ]}
                                                        >
                                                            <Avatar uri={item?.senderId?.avatar} style={styles.avatar} />
                                                            <View style={[styles.boxMessageContent, highlightMessageReplyto === item?._id && styles.highlightReplyMessage]}>
                                                                {conversation?.type === "private" ? null : <Text style={styles.textNameOthers}>{item?.senderId?.name}</Text>}
                                                                <Text style={{ fontStyle: "italic", color: 'gray' }}>Tin nhắn đã bị thu hồi</Text>
                                                                <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                {
                                                                    (index === 0 || item?.like?.length > 0) && (
                                                                        <View style={styles.boxLike}>
                                                                            {
                                                                                item?.like?.length > 0 ? (
                                                                                    <TouchableOpacity style={styles.boxTotalLike}>
                                                                                        <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                        <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                    </TouchableOpacity>) : null
                                                                            }
                                                                            <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                                <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    )
                                                                }
                                                            </View>
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <TouchableOpacity
                                                            onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                            onLongPress={() => handleLongPress(item)}
                                                            style={[
                                                                styles.messageOfOther,
                                                                { marginBottom: item?.like?.length > 0 ? 10 : 0 }
                                                            ]}
                                                        >
                                                            <Avatar uri={item?.senderId?.avatar} style={styles.avatar} />
                                                            <View style={[styles.boxMessageContent, { width: item?.files?.fileType === "audio/m4a" ? "80%" : "" }, highlightMessageReplyto === item?._id && styles.highlightReplyMessage]}>
                                                                {conversation?.type === "private" ? null : <Text style={styles.textNameOthers}>{item?.senderId?.name}</Text>}
                                                                {item?.attachments?.length > 0 && (
                                                                    <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                                )}
                                                                {item?.files !== null && (
                                                                    item?.files?.fileType === "audio/m4a" ? <AudioPlayer uri={item?.files?.fileUrl} /> : <ViewFile file={item?.files} />
                                                                )}
                                                                {item?.media && (
                                                                    <Video
                                                                        ref={videoRef}
                                                                        style={{ width: wp(73), height: hp(20) }}
                                                                        source={{ uri: item?.media?.fileUrl }}
                                                                        useNativeControls
                                                                        resizeMode="contain"
                                                                        isLooping={false}
                                                                        shouldPlay={false}
                                                                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                                                    />
                                                                )}
                                                                {item?.content && (item?.replyTo ?
                                                                    <>
                                                                        <AttachReplytoMessage message={item?.replyTo} />
                                                                        <ParsedText
                                                                            style={styles.textMessage}
                                                                            parse={[
                                                                                {
                                                                                    type: "url",
                                                                                    style: styles.url,
                                                                                    onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                                },
                                                                            ]}
                                                                        >
                                                                            {item?.content}
                                                                        </ParsedText>
                                                                    </>
                                                                    :
                                                                    <ParsedText
                                                                        style={styles.textMessage}
                                                                        parse={[
                                                                            {
                                                                                type: "url",
                                                                                style: styles.url,
                                                                                onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {item?.content}
                                                                    </ParsedText>
                                                                )}
                                                                <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                {
                                                                    (index === 0 || item?.like?.length > 0) && (
                                                                        <View style={styles.boxLike}>
                                                                            {
                                                                                item?.like?.length > 0 ? (
                                                                                    <TouchableOpacity style={styles.boxTotalLike}>
                                                                                        <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                        <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                    </TouchableOpacity>) : null
                                                                            }
                                                                            <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                                <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    )
                                                                }
                                                            </View>
                                                        </TouchableOpacity>
                                                    )
                                                )

                                            )
                                            :
                                            (item?.senderId?._id === messages[index + 1]?.senderId?._id) ?

                                                (
                                                    item?.removed?.includes(user?.id) ? null : (
                                                        item?.revoked ? (
                                                            <TouchableOpacity
                                                                onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                                onLongPress={() => handleLongPress(item)}
                                                                style={[
                                                                    styles.messageOfOther,
                                                                    { marginTop: 5, marginBottom: item?.like?.length > 0 ? 10 : 0 }
                                                                ]}
                                                            >
                                                                {messages[index + 1]?.removed?.includes(user?.id) ? <Avatar uri={item?.senderId?.avatar} style={styles.avatar} /> : <Image style={styles.avatar} />}
                                                                <View style={[styles.boxMessageContent, highlightMessageReplyto === item?._id && styles.highlightReplyMessage]}>
                                                                    <Text style={{ fontStyle: "italic", color: 'gray' }}>Tin nhắn đã bị thu hồi</Text>
                                                                    {(index === messages?.length - 1) ?
                                                                        ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                        :
                                                                        (index === 0) ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                            :
                                                                            ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                    }
                                                                    {
                                                                        (index === 0 || item?.like?.length > 0) && (
                                                                            <View style={styles.boxLike}>
                                                                                {
                                                                                    item?.like?.length > 0 ? (
                                                                                        <TouchableOpacity style={styles.boxTotalLike}>
                                                                                            <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                            <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                        </TouchableOpacity>) : null
                                                                                }
                                                                                <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )
                                                                    }
                                                                </View>
                                                            </TouchableOpacity>
                                                        ) : (
                                                            <TouchableOpacity
                                                                onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                                onLongPress={() => handleLongPress(item)}
                                                                style={[
                                                                    styles.messageOfOther,
                                                                    { marginTop: 5, marginBottom: item?.like?.length > 0 ? 10 : 0 }
                                                                ]}
                                                            >
                                                                {messages[index + 1]?.removed?.includes(user?.id) ? <Avatar uri={item?.senderId?.avatar} style={styles.avatar} /> : <Image style={styles.avatar} />}
                                                                <View
                                                                    style={[styles.boxMessageContent, { width: item?.files?.fileType === "audio/m4a" ? "80%" : "" }, highlightMessageReplyto === item?._id && styles.highlightReplyMessage]}>
                                                                    {item?.attachments?.length > 0 && (
                                                                        <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                                    )}
                                                                    {item?.files !== null && (
                                                                        item?.files?.fileType === "audio/m4a" ? <AudioPlayer uri={item?.files?.fileUrl} /> : <ViewFile file={item?.files} />
                                                                    )}
                                                                    {item?.media && (
                                                                        <Video
                                                                            ref={videoRef}
                                                                            style={{ width: wp(73), height: hp(20) }}
                                                                            source={{ uri: item?.media?.fileUrl }}
                                                                            useNativeControls
                                                                            resizeMode="contain"
                                                                            isLooping={false}
                                                                            shouldPlay={false}
                                                                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                                                        />
                                                                    )}
                                                                    {item?.content && (item?.replyTo ?
                                                                        <>
                                                                            <AttachReplytoMessage message={item?.replyTo} />
                                                                            <ParsedText
                                                                                style={styles.textMessage}
                                                                                parse={[
                                                                                    {
                                                                                        type: "url",
                                                                                        style: styles.url,
                                                                                        onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {item?.content}
                                                                            </ParsedText>
                                                                        </>
                                                                        :
                                                                        <ParsedText
                                                                            style={styles.textMessage}
                                                                            parse={[
                                                                                {
                                                                                    type: "url",
                                                                                    style: styles.url,
                                                                                    onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                                },
                                                                            ]}
                                                                        >
                                                                            {item?.content}
                                                                        </ParsedText>
                                                                    )}
                                                                    {(index === messages?.length - 1) ?
                                                                        ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                        :
                                                                        (index === 0) ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                            :
                                                                            ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                    }
                                                                    {
                                                                        (index === 0 || item?.like?.length > 0) && (
                                                                            <View style={styles.boxLike}>
                                                                                {
                                                                                    item?.like?.length > 0 ? (
                                                                                        <TouchableOpacity style={styles.boxTotalLike}>
                                                                                            <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                            <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                        </TouchableOpacity>) : null
                                                                                }
                                                                                <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )
                                                                    }
                                                                </View>
                                                            </TouchableOpacity>
                                                        )
                                                    )

                                                )
                                                :
                                                (
                                                    item?.removed?.includes(user?.id) ? null : (
                                                        item?.revoked ? (
                                                            <TouchableOpacity
                                                                onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                                onLongPress={() => handleLongPress(item)}
                                                                style={[
                                                                    styles.messageOfOther,
                                                                    { marginBottom: item?.like?.length > 0 ? 10 : 0 }
                                                                ]}
                                                            >
                                                                <Avatar uri={item?.senderId?.avatar} style={styles.avatar} />
                                                                <View style={[styles.boxMessageContent, highlightMessageReplyto === item?._id && styles.highlightReplyMessage]}>
                                                                    <Text style={{ fontStyle: "italic", color: 'gray' }}>Tin nhắn đã bị thu hồi</Text>
                                                                    {(index === messages?.length - 1) ?
                                                                        ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                        :
                                                                        (index === 0) ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                            :
                                                                            ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                    }
                                                                    {
                                                                        (index === 0 || item?.like?.length > 0) && (
                                                                            <View style={styles.boxLike}>
                                                                                {
                                                                                    item?.like?.length > 0 ? (
                                                                                        <TouchableOpacity style={styles.boxTotalLike}>
                                                                                            <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                            <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                        </TouchableOpacity>) : null
                                                                                }
                                                                                <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                                    <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )
                                                                    }
                                                                </View>
                                                            </TouchableOpacity>
                                                        ) : (
                                                            <TouchableOpacity
                                                                onPress={() => item?.replyTo && scrollToReplyMessage(item?.replyTo?._id)}
                                                                onLongPress={() => handleLongPress(item)}
                                                                style={[
                                                                    styles.messageOfOther,
                                                                    { marginBottom: item?.like?.length > 0 ? 10 : 0 },
                                                                ]}
                                                            >
                                                                <Avatar uri={item?.senderId?.avatar} style={styles.avatar} />
                                                                <View
                                                                    style={[
                                                                        styles.boxMessageContent,
                                                                        { width: item?.files?.fileType === "audio/m4a" ? "80%" : "" },
                                                                        highlightMessageReplyto === item?._id && styles.highlightReplyMessage
                                                                    ]}
                                                                >
                                                                    {conversation?.type === "private" ? null : <Text style={styles.textNameOthers}>{item?.senderId?.name}</Text>}
                                                                    {item?.attachments?.length > 0 && (
                                                                        <RenderImageMessage images={item?.attachments} wh={wp(70)} />
                                                                    )}
                                                                    {item?.files !== null && (
                                                                        item?.files?.fileType === "audio/m4a" ? <AudioPlayer uri={item?.files?.fileUrl} /> : <ViewFile file={item?.files} />
                                                                    )}
                                                                    {item?.media && (
                                                                        <Video
                                                                            ref={videoRef}
                                                                            style={{ width: wp(73), height: hp(20) }}
                                                                            source={{ uri: item?.media?.fileUrl }}
                                                                            useNativeControls
                                                                            resizeMode="contain"
                                                                            isLooping={false}
                                                                            shouldPlay={false}
                                                                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                                                        />
                                                                    )}
                                                                    {item?.content && (item?.replyTo ?
                                                                        <>
                                                                            <AttachReplytoMessage message={item?.replyTo} />
                                                                            <ParsedText
                                                                                style={styles.textMessage}
                                                                                parse={[
                                                                                    {
                                                                                        type: "url",
                                                                                        style: styles.url,
                                                                                        onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {item?.content}
                                                                            </ParsedText>
                                                                        </>
                                                                        :
                                                                        <ParsedText
                                                                            style={styles.textMessage}
                                                                            parse={[
                                                                                {
                                                                                    type: "url",
                                                                                    style: styles.url,
                                                                                    onPress: (url) => Linking.openURL(url).catch((err) => console.error("Error opening URL:", err)),
                                                                                },
                                                                            ]}
                                                                        >
                                                                            {item?.content}
                                                                        </ParsedText>
                                                                    )}
                                                                    {(index === messages?.length - 1) ?
                                                                        ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                        :
                                                                        (index === 0) ? <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
                                                                            :
                                                                            ((item?.senderId?._id === messages[index - 1]?.senderId?._id) ? null : <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>)
                                                                    }
                                                                </View>
                                                                {
                                                                    (index === 0 || item?.like?.length > 0) && (
                                                                        <View style={styles.boxLike}>
                                                                            {
                                                                                item?.like?.length > 0 ? (
                                                                                    <TouchableOpacity style={styles.boxTotalLike}>
                                                                                        <Icon name="heart" size={wp(3.5)} fill="red" color="red" />
                                                                                        <Text style={{ fontSize: 12 }}>{item?.like.reduce((sum, i) => sum + i.totalLike, 0)}</Text>
                                                                                    </TouchableOpacity>) : null
                                                                            }
                                                                            <TouchableOpacity style={styles.boxHeart} onPress={() => handleLike(item?._id, "like", user?.id)}>
                                                                                <Icon name="heart" size={wp(3.5)} fill={`${item?.like?.length > 0 ? "red" : "white"}`} color={`${item?.like?.length > 0 ? "red" : "gray"}`} />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    )
                                                                }
                                                            </TouchableOpacity>
                                                        )
                                                    )
                                                )
                                )}
                                // Để hiển thị tin nhắn mới nhất
                                inverted
                                ListFooterComponent={<View style={{ height: 20 }} />}
                                ListHeaderComponent={<View style={{ height: 35 }} />}
                            />
                        )
                    }
                </View>

                {/* Giao diện nhập tin nhắn */}
                <View style={styles.inputContainer}>
                    {/* Hiển thị tin nhắn đang trả lời */}
                    {messageReplyto && (
                        <ReplytoMessageSelected messageReplyto={messageReplyto} setMessageReplyto={setMessageReplyto} />
                    )}
                    {/* Hộp nhập tin nhắn */}
                    <View style={styles.sendMessage}>
                        <View style={styles.boxSendMessage}>
                            <TouchableOpacity onPress={() => toggleGallery("emoji")}>
                                <Icon name="emoji" size={28} color="gray" />
                            </TouchableOpacity>
                            <TextInput style={styles.textInputMessage} ref={inputRef} placeholder="Tin nhắn" value={message} onChangeText={(text) => setMessage(text)} />
                        </View>
                        {message === "" && attachments?.length === 0 ? (
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
                                (<EmojiPicker onSelect={emoji => setMessage(prev => prev + emoji)} />)
                                :
                                option === "image" ?
                                    (
                                        <FlatList
                                            data={photos}
                                            numColumns={3}
                                            keyExtractor={(item) => item?.uri}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity onPress={() => selectImage(item)} style={{ position: "relative" }}>
                                                    <View style={{ position: "absolute", top: 7, right: 7, zIndex: 50 }}>
                                                        <RadioButton isSelect={attachments.includes(item)} size={20} color={theme.colors.primary} onPress={() => selectImage(item)} />
                                                    </View>
                                                    <Image source={{ uri: item?.uri }} style={styles.galleryImage} />
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
                                                    <TouchableOpacity style={styles.buttonExtend} onPress={handlePickVideo}>
                                                        <View style={[styles.boxIcon, { backgroundColor: "#2196F3" }]}>
                                                            <Icon name="media" size={26} color="#fff" />
                                                        </View>
                                                        <Text>Video</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )
                                        :
                                        (
                                            <AudioCart
                                                conversation={conversation}
                                                parsedData={parsedData}
                                                setMessages={setMessages}
                                                setStempId={setStempId}
                                                setConversation={setConversation}
                                                setShowGallery={setShowGallery}
                                            />
                                        )
                            }
                        </View>
                    )}
                </View>
            </View>

            {/* Modal hiển thị các tùy chọn khi nhấn giữ tin nhắn */}
            <MessageOptionsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onReply={handleReply}
                onForward={handleForward}
                onDelete={handleDelete}
                onRecall={handleRecall}
                isSender={selectedMessage?.senderId?._id === user?.id} // Only show "Thu hồi" if the user is the sender
                isLike={selectedMessage?.like?.some(like => like.userId === user?.id)}
                onDisLike={() => { setModalVisible(false); handleLike(selectedMessage?._id, "dislike", user?.id) }}
                onLike={() => { setModalVisible(false); handleLike(selectedMessage?._id, "like", user?.id) }}
                isRevoked={selectedMessage?.revoked}
            />
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
        minWidth: wp(26),
        minHeight: hp(5),
        position: "relative",
    },
    messageOfOther: {
        alignSelf: "flex-start",
        borderColor: "gray",
        flexDirection: "row",
        marginHorizontal: 15,
        marginTop: 10,
        minWidth: wp(25),
        minHeight: hp(5),
    },
    boxMessageContent: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: wp(80),
        marginLeft: 10,
        borderColor: theme.colors.darkLight,
        borderWidth: 0.5,
        minWidth: wp(25),
        minHeight: hp(5),
        position: "relative",
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
        paddingVertical: 5,
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
    },

    //
    boxSeen: {
        backgroundColor: theme.colors.lightGray,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 20,
        alignSelf: "flex-end",
        marginTop: 5,
        position: "absolute",
        right: -wp(1),
        bottom: -(wp(7)),
    },

    //
    boxLike: {
        position: "absolute",
        bottom: -(wp(2)),
        right: wp(2),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // padding: 5,
    },
    boxHeart: {
        backgroundColor: "white",
        width: wp(5),
        height: wp(5),
        borderRadius: wp(5) / 2,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 0.4,
        borderColor: "gray",
    },
    boxTotalLike: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "white",
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 50,
        marginRight: 5,
        borderWidth: 0.4,
        borderColor: "gray",
    },

    // style highlight tin nhắn
    highlightReplyMessage: {
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    url: {
        color: theme.colors.primary,
        textDecorationLine: "underline",
    },
});