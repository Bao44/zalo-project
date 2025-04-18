import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    FlatList,
    SectionList,
    Animated,
    Alert,
    BackHandler,
} from "react-native";
import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import RadioButton from "../../components/RadioButton";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getConversations, createConversation1vs1 } from "../../api/conversationAPI";
import { getFriends } from "../../api/friendshipAPI";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import { sendMessage } from "../../api/messageAPI";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import AttachReplytoMessage from "@/components/AttachReplytoMessage";
import Loading from "@/components/Loading";

const ForwardMessage = () => {
    const { user } = useAuth();
    const { messageForward } = useLocalSearchParams();
    const [selectedTab, setSelectedTab] = useState("recent");
    const [recent, setRecent] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [search, setSearch] = useState("");
    const slideAnim = useRef(new Animated.Value(100)).current;
    const [loading, setLoading] = useState(false);

    const paramMessage = JSON.parse(messageForward) || null;

    // Lấy danh sách gần đây, danh bạ và nhóm
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy danh sách bạn bè (danh bạ)
                const resContact = await getFriends(user?.id);
                setContacts(resContact.data);

                // Lấy danh sách hội thoại
                const response = await getConversations(user?.id);
                if (response.success) {
                    const conversations = response.data;

                    // Lọc các hội thoại private để tạo danh sách gần đây
                    const privateConvs = conversations
                        .filter((conv) => conv.type === "private")
                        .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

                    const recentData = resContact.data
                        .map((friend) => {
                            const conv = privateConvs.find(
                                (c) => c.members[0]._id === friend._id || c.members[1]._id === friend._id
                            );
                            if (conv) {
                                return {
                                    ...friend,
                                    time: conv.lastMessage?.createdAt,
                                    conversationId: conv._id,
                                };
                            }
                            return null;
                        })
                        .filter(Boolean);
                    setRecent(recentData);

                    // Lọc các hội thoại nhóm
                    const groupConvs = conversations
                        .filter((conv) => conv.type === "group")
                        .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));
                    setGroups(groupConvs);
                } else {
                    Alert.alert("Lỗi", "Không thể lấy danh sách hội thoại");
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
                Alert.alert("Lỗi", "Đã xảy ra lỗi khi lấy dữ liệu");
            }
        };
        fetchData();
    }, [user?.id]);

    // Animation cho danh sách đã chọn
    useEffect(() => {
        if (selectedItems.length > 0) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedItems]);

    // Xử lý nút Back
    const handleBackPress = () => {
        if (selectedItems.length > 0) {
            Alert.alert(
                "Xác nhận",
                "Bạn có muốn hủy chuyển tiếp tin nhắn?",
                [
                    { text: "Ở lại", style: "cancel" },
                    { text: "Hủy", onPress: () => router.back() },
                ]
            );
            return true;
        }
        return false;
    };

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener("hardwareBackPress", handleBackPress);
            return () => {
                BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
            };
        }, [selectedItems])
    );

    // Chọn người dùng hoặc nhóm
    const toggleSelection = (item) => {
        setSelectedItems((prev) => {
            const isSelected = prev.some((i) => i._id === item._id);
            if (isSelected) {
                return prev.filter((i) => i._id !== item._id);
            } else {
                return [...prev, item];
            }
        });
    };

    // Nhóm danh bạ theo chữ cái
    const groupUsersByFirstLetter = (listFriends) => {
        const grouped = listFriends.reduce((acc, friend) => {
            const firstLetter = friend.name[0].toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(friend);
            return acc;
        }, {});

        return Object.keys(grouped)
            .sort()
            .map((letter) => ({
                title: letter,
                data: grouped[letter],
            }));
    };
    const groupedContacts = useMemo(() => groupUsersByFirstLetter(contacts), [contacts]);

    // Nén ảnh trước khi gửi
    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: "jpeg" }
        );
        return manipulatedImage.uri;
    };

    // Gửi tin nhắn đã chuyển tiếp
    const handleForwardMessage = async () => {
        setLoading(true);
        try {
            for (const item of selectedItems) {
                let conversationId = item.conversationId || item._id;

                // Nếu là người dùng (không phải nhóm) và chưa có hội thoại, tạo mới
                if (!item.conversationId && !item.type) {
                    const response = await createConversation1vs1(user?.id, item._id);
                    if (response.success && response.data) {
                        conversationId = response.data._id;
                    } else {
                        Alert.alert("Lỗi", `Không thể tạo hội thoại với ${item.name}`);
                        continue;
                    }
                }

                // Xử lý ảnh đính kèm (nếu có)
                let images = [];
                if (paramMessage?.attachments?.length > 0) {
                    images = await Promise.all(
                        paramMessage.attachments.map(async (attachment) => {
                            // Giả sử attachment là URL, tải về trước
                            const localUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
                            const downloadResult = await FileSystem.downloadAsync(attachment, localUri);
                            const compressedUri = await compressImage(downloadResult.uri);
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

                // Xử lý file đính kèm (nếu có)
                let file = null;
                if (paramMessage?.files) {
                    // Tải tệp từ URL về thiết bị
                    const localUri = `${FileSystem.cacheDirectory}${paramMessage.files.fileName || Date.now() + ".pdf"}`;
                    const downloadResult = await FileSystem.downloadAsync(paramMessage.files.fileUrl, localUri);
                    const fileBase64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    file = {
                        uri: fileBase64,
                        name: paramMessage.files.fileName,
                        type: paramMessage.files.fileType,
                    };
                }

                // Xử lý video (nếu có)
                let media = null;
                if (paramMessage?.media) {
                    // Tải video từ URL về thiết bị
                    const localUri = `${FileSystem.cacheDirectory}${paramMessage.media.fileName || Date.now() + ".mp4"}`;
                    const downloadResult = await FileSystem.downloadAsync(paramMessage.media.fileUrl, localUri);
                    const fileBase64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    media = {
                        uri: fileBase64,
                        name: paramMessage.media.fileName,
                        type: paramMessage.media.fileType,
                    };
                }

                const messageData = {
                    idTemp: Date.now().toString(),
                    senderId: user?.id,
                    content: paramMessage.content || "",
                    attachments: images.length > 0 ? images : null,
                    media: media,
                    file: file,
                    receiverId: item.type ? null : item._id, // Nếu là nhóm, không cần receiverId
                    replyTo: null,
                };

                // Gửi tin nhắn
                const response = await sendMessage(conversationId, messageData);
                if (!response.success) {
                    Alert.alert("Lỗi", `Không thể chuyển tiếp tin nhắn đến ${item.name}`);
                }
            }

            setLoading(false);
            router.back();
        } catch (error) {
            console.error("Lỗi khi chuyển tiếp tin nhắn:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi chuyển tiếp tin nhắn");
        }
    };

    // Format thời gian
    const formatTime = (messageTime) => {
        if (!messageTime) return "";
        const diff = (Date.now() - new Date(messageTime)) / 1000;
        if (diff < 60) return "Vừa xong";
        if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày`;
        const date = new Date(messageTime);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    // Lọc dữ liệu theo tìm kiếm
    const filteredRecent = useMemo(() => {
        if (!search) return recent;
        return recent.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, recent]);

    const filteredContacts = useMemo(() => {
        if (!search) return groupedContacts;
        return groupUsersByFirstLetter(
            contacts.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, contacts]);

    const filteredGroups = useMemo(() => {
        if (!search) return groups;
        return groups.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, groups]);

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => handleBackPress() || router.back()}>
                    <Icon style={styles.iconGoback} name="arrowLeft" size={32} strokeWidth={1.6} color="black" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.textTitle}>Chia sẽ</Text>
                    <Text style={{ color: theme.colors.textLight }}>
                        Đã chọn: {selectedItems.length}
                    </Text>
                </View>
            </View>

            {/* MessageForward */}
            <View style={{ paddingVertical: 10, alignItems: "flex-start", justifyContent: "center", paddingHorizontal: 20 }}>
                <AttachReplytoMessage message={paramMessage} />
            </View>

            {/* Search and Tabs */}
            <View style={styles.boxSearch}>
                <Icon name="search" size={24} strokeWidth={1.6} color="gray" />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Tìm kiếm người nhận"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Tabs for Recent, Contacts, Groups */}
            <View style={styles.boxSelect}>
                <TouchableOpacity onPress={() => setSelectedTab("recent")}>
                    <Text style={selectedTab === "recent" ? styles.textActive : styles.textNoActive}>
                        Gần đây
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("contact")}>
                    <Text style={selectedTab === "contact" ? styles.textActive : styles.textNoActive}>
                        Danh bạ
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("group")}>
                    <Text style={selectedTab === "group" ? styles.textActive : styles.textNoActive}>
                        Nhóm
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List of Recent, Contacts, Groups */}
            <View style={{ height: hp(65) }}>
                {selectedTab === "recent" && (
                    <FlatList
                        data={filteredRecent}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.buttonItem}
                                onPress={() => toggleSelection(item)}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Avatar uri={item.avatar} style={styles.avatar} />
                                    <View>
                                        <Text style={styles.textName}>{item.name}</Text>
                                        {item.time && (
                                            <Text style={{ color: theme.colors.textLight, marginTop: 5 }}>
                                                {formatTime(item.time)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <RadioButton
                                    isSelect={selectedItems.some((i) => i._id === item._id)}
                                    size={20}
                                    color={theme.colors.primaryDark}
                                    onPress={() => toggleSelection(item)}
                                />
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={<View style={styles.listFooterComponent} />}
                    />
                )}

                {selectedTab === "contact" && (
                    <SectionList
                        sections={filteredContacts}
                        keyExtractor={(item, index) => item._id + index}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.buttonItem}
                                onPress={() => toggleSelection(item)}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Avatar uri={item.avatar} style={styles.avatar} />
                                    <Text style={styles.textName}>{item.name}</Text>
                                </View>
                                <RadioButton
                                    isSelect={selectedItems.some((i) => i._id === item._id)}
                                    size={20}
                                    color={theme.colors.primaryDark}
                                    onPress={() => toggleSelection(item)}
                                />
                            </TouchableOpacity>
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        ListFooterComponent={<View style={styles.listFooterComponent} />}
                    />
                )}

                {selectedTab === "group" && (
                    <FlatList
                        data={filteredGroups}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.buttonItem}
                                onPress={() => toggleSelection(item)}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Avatar uri={item.avatar} style={styles.avatar} />
                                    <View>
                                        <Text style={styles.textName}>{item.name}</Text>
                                        {item.lastMessage && (
                                            <Text style={{ color: theme.colors.textLight, marginTop: 5 }}>
                                                {formatTime(item.lastMessage.createdAt)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <RadioButton
                                    isSelect={selectedItems.some((i) => i._id === item._id)}
                                    size={20}
                                    color={theme.colors.primaryDark}
                                    onPress={() => toggleSelection(item)}
                                />
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={<View style={styles.listFooterComponent} />}
                    />
                )}
            </View>

            {/* Selected Items Box */}
            {selectedItems.length > 0 && (
                <Animated.View
                    style={[styles.boxSelected, { transform: [{ translateY: slideAnim }] }]}
                >
                    <FlatList
                        data={selectedItems}
                        keyExtractor={(item) => item._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => toggleSelection(item)}>
                                <Avatar uri={item.avatar} style={styles.avatar} />
                                <View style={styles.cancel}>
                                    <Icon name="cancel" size={12} strokeWidth={2.6} color="white" />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.forwardButton} onPress={handleForwardMessage}>
                        <Icon name="sent" size={32} strokeWidth={1.6} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Modal loading */}
            {loading && (
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                    <Loading />
                </View>
            )}
        </ScreenWrapper>
    );
};

export default ForwardMessage;

const styles = StyleSheet.create({
    header: {
        backgroundColor: theme.colors.gray,
        height: hp(7),
        flexDirection: "row",
        alignItems: "center",
    },
    iconGoback: {
        marginHorizontal: 20
    },
    textTitle: {
        fontSize: 18,
        fontWeight: theme.fonts.medium,
    },
    boxSearch: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.gray,
        height: hp(5),
        marginHorizontal: 20,
        borderRadius: theme.radius.xs,
        paddingHorizontal: 10,
    },
    inputSearch: {
        fontSize: 16,
        width: wp(80),
        marginLeft: 10,
    },
    boxSelect: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grayLight,
        height: hp(5),
    },
    textActive: {
        textTransform: "uppercase",
        fontSize: 14,
        color: "black",
        fontWeight: theme.fonts.bold,
        borderBottomWidth: 1,
        borderBottomColor: "black",
        height: "100%",
        lineHeight: hp(5),
        width: wp(25),
        textAlign: "center",
    },
    textNoActive: {
        textTransform: "uppercase",
        fontSize: 14,
        color: theme.colors.textLight,
        height: "100%",
        lineHeight: hp(5),
        width: wp(25),
        textAlign: "center",
    },
    buttonItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 20,
    },
    textName: {
        fontSize: 16,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "bold",
        paddingHorizontal: 20,
        paddingVertical: 5,
    },
    boxSelected: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 10,
    },
    forwardButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    cancel: {
        position: "absolute",
        top: 0,
        right: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray",
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    listFooterComponent: {
        height: hp(18),
    },
});