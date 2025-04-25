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
import { addMemberToGroup, getConversations } from "../../api/conversationAPI";
import { getFriends } from "../../api/friendshipAPI";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import Loading from "@/components/Loading";

const SelectAddMembersGroup = () => {
    const { user } = useAuth();
    const { conver } = useLocalSearchParams();
    const paramDataConver = JSON.parse(conver);
    const [selectedTab, setSelectedTab] = useState("recent");
    const [recent, setRecent] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [search, setSearch] = useState("");
    const slideAnim = useRef(new Animated.Value(100)).current;
    const [loading, setLoading] = useState(false);

    // Lấy danh sách gần đây, danh bạ và nhóm
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resContact = await getFriends(user?.id);
                setContacts(resContact.data);

                const response = await getConversations(user?.id);
                if (response.success) {
                    const conversations = response.data;

                    const privateConvs = conversations
                        .filter((conv) => conv.type === "private")
                        .sort((a, b) => {
                            if (!a.lastMessage?.createdAt && !b.lastMessage?.createdAt) return 0;
                            if (!a.lastMessage?.createdAt) return 1;
                            if (!b.lastMessage?.createdAt) return -1;
                            const timeA = new Date(a.lastMessage.createdAt);
                            const timeB = new Date(b.lastMessage.createdAt);
                            return timeB - timeA;
                        });

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
                        .filter(Boolean)
                        .sort((a, b) => {
                            const timeA = a.time ? new Date(a.time) : new Date(0);
                            const timeB = b.time ? new Date(b.time) : new Date(0);
                            return timeB - timeA;
                        });

                    setRecent(recentData);
                } else {
                    Alert.alert("Lỗi", "Không thể lấy danh sách hội thoại");
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
                Alert.alert("Lỗi", "Đã xảy ra lỗi khi lấy dữ liệu");
            }
        };
        if (user?.id) {
            fetchData();
        }
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
        if (selectedItems.some((i) => i._id === item._id)) {
            setSelectedItems(selectedItems.filter((i) => i._id !== item._id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
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

    // Thực hiện thêm thành viên vào nhóm
    const handleAddMembers = async () => {
        setLoading(true);
        try {
            const response = await addMemberToGroup(paramDataConver._id, selectedItems.map((item) => item._id));
            if (response.success) {
                router.back();
            } else {
                Alert.alert("Lỗi", response.data.message || "Có lỗi xảy ra!");
            }
        } catch (error) {
            console.error("Lỗi khi thêm thành viên:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm thành viên");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => handleBackPress() || router.back()}>
                    <Icon style={styles.iconGoback} name="arrowLeft" size={32} strokeWidth={1.6} color="black" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.textTitle}>Thêm vào nhóm</Text>
                    <Text style={{ color: theme.colors.textLight }}>
                        Đã chọn: {selectedItems.length}
                    </Text>
                </View>
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

            {/* Tabs for Recent, Contacts */}
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
            </View>

            {/* List of Recent, Contacts */}
            <View style={{ height: hp(65) }}>
                {selectedTab === "recent" && (
                    <FlatList
                        data={filteredRecent}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.buttonItem}
                                onPress={() => { paramDataConver?.members?.some((i) => i._id === item._id) || paramDataConver?.listApprovedMembers?.some((i) => i._id === item._id) ? null : toggleSelection(item) }}
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
                                {paramDataConver?.members?.some((i) => i._id === item._id) ? (
                                    <Text style={{ color: theme.colors.primaryDark }}>
                                        Đã tham gia
                                    </Text>
                                ) : (
                                    paramDataConver?.listApprovedMembers?.some((i) => i._id === item._id) ? (
                                        <Text style={{ color: theme.colors.primaryDark }}>Đã thêm</Text>
                                    ) : (
                                        <RadioButton
                                            isSelect={selectedItems.some((i) => i._id === item._id)}
                                            size={20}
                                            color={theme.colors.primaryDark}
                                            onPress={() => toggleSelection(item)}
                                        />
                                    )
                                )}
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
                                onPress={() => { paramDataConver?.members?.some((i) => i._id === item._id) || paramDataConver?.listApprovedMembers?.some((i) => i._id === item._id) ? null : toggleSelection(item) }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Avatar uri={item.avatar} style={styles.avatar} />
                                    <Text style={styles.textName}>{item.name}</Text>
                                </View>
                                {paramDataConver?.members?.some((i) => i._id === item._id) ? (
                                    <Text style={{ color: theme.colors.primaryDark }}>
                                        Đã tham gia
                                    </Text>
                                ) : (
                                    paramDataConver?.listApprovedMembers?.some((i) => i._id === item._id) ? (
                                        <Text style={{ color: theme.colors.primaryDark }}>Đã thêm</Text>
                                    ) : (
                                        <RadioButton
                                            isSelect={selectedItems.some((i) => i._id === item._id)}
                                            size={20}
                                            color={theme.colors.primaryDark}
                                            onPress={() => toggleSelection(item)}
                                        />
                                    )
                                )}
                            </TouchableOpacity>
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
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
                    <TouchableOpacity style={styles.forwardButton} onPress={handleAddMembers}>
                        <Icon name="arrowRight" size={32} strokeWidth={1.6} color="white" />
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

export default SelectAddMembersGroup;

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
        margin: 20,
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