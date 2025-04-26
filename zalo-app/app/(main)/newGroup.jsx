import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Image, SectionList, Animated, Alert, BackHandler } from "react-native";
import React, { useEffect, useRef, useCallback } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { useState, useMemo } from "react";
// import users from "../../assets/dataLocals/UserLocal";
import RadioButton from "../../components/RadioButton";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getConversations } from "../../api/conversationAPI";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import * as ImagePicker from "expo-image-picker";
import { createConversationGroupChat } from "../../api/conversationAPI";
import * as FileSystem from "expo-file-system";
import { getFriends } from "../../api/friendshipAPI";
import { useLocalSearchParams } from "expo-router";


const NewGroup = () => {
    const { user } = useAuth();
    const [isFocused, setIsFocused] = useState(false);
    const [selected, setSelected] = useState("recent");
    const [recent, setRecent] = useState([]);
    const [contact, setContact] = useState([])
    const [userSelecteds, setUserSelecteds] = useState([]);
    const [nameGroup, setNameGroup] = useState("");
    const [avatarGroup, setAvatarGroup] = useState("");
    const [search, setSearch] = useState("");
    const params = useLocalSearchParams();


    // Khởi tạo userSelecteds với người dùng được chọn trước (nếu có)
    useEffect(() => {
        if (params.preSelectedUser) {
            try {
                const preSelectedUser = JSON.parse(params.preSelectedUser); // Chuyển chuỗi JSON thành object
                setUserSelecteds([preSelectedUser]); // Thêm người dùng vào danh sách đã chọn
            } catch (error) {
                console.error("Lỗi phân tích preSelectedUser:", error);
            }
        }
    }, [params.preSelectedUser]);

    // Lấy danh sách người dùng gần đây và danh bạ
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                // Lấy danh sách bạn bè
                const resContact = await getFriends(user?.id);
                setContact(resContact.data); // Lưu danh sách bạn bè vào state

                // Lấy danh sách hội thoại
                const response = await getConversations(user?.id);
                if (response.success) {
                    let ds = response.data;

                    // Sắp xếp theo thời gian lastMessage
                    ds.sort((a, b) => {
                        const timeA = new Date(a.lastMessage.createdAt);
                        const timeB = new Date(b.lastMessage.createdAt);
                        return timeB - timeA;
                    });

                    // Lọc các hội thoại private
                    let temp = ds.filter((u) => u.type === "private");

                    const recentData = resContact.data.map((user) => {
                        const conv = temp.find(
                            (c) => c.members[0]._id === user._id || c.members[1]._id === user._id
                        );
                        if (conv) {
                            return {
                                ...user,
                                time: conv.lastMessage.createdAt, // chỉ thêm createdAt
                            };
                        }
                        return null;
                    }).filter(Boolean);

                    setRecent(recentData);// Lưu danh sách hội thoại vào state
                } else {
                    console.log("Không có dữ liệu hoặc lỗi từ server!");
                }
            } catch (error) {
                console.log("Lỗi lấy danh sách:", error);
            }
        };
        fetchRecent();
    }, []);

    //Back to previous screen
    const handleBackPress = () => {
        if (userSelecteds.length > 0 || nameGroup !== "") {
            Alert.alert(
                "Xác nhận",
                "Chưa tạo nhóm xong. Thoát khỏi trang này?",
                [
                    { text: "Ở lại", style: "cancel" },
                    { text: "Thoát", onPress: () => router.back() }
                ]
            );
            return true; // Chặn hành động mặc định của nút Back
        } else {
            return false; // Cho phép quay lại bình thường
        }
    };

    useFocusEffect(
        useCallback(() => {
            // Đăng ký sự kiện BackHandler
            BackHandler.addEventListener("hardwareBackPress", handleBackPress);
            // Cleanup khi rời khỏi màn hình
            return () => {
                BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
            };
        }, [userSelecteds, nameGroup])
    );

    // Chức năng chọn người dùng
    const toggleSelection = (item) => {
        setUserSelecteds((prev) => {
            const isSelected = prev.some((u) => u._id === item._id);
            if (isSelected) {
                return prev.filter((u) => u._id !== item._id);
            } else {
                // Store the item without the time property to keep consistency
                const { time, ...cleanedItem } = item;
                return [...prev, cleanedItem];
            }
        });
    };

    // Nhóm bạn bè theo chữ cái đầu tiên
    const groupUsersByFirstLetter = (listFriends) => {
        const grouped = listFriends.reduce((acc, friend) => {
            const firstLetter = friend.name[0].toUpperCase(); // Lấy chữ cái đầu tiên
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(friend);
            return acc;
        }, {});

        // Chuyển đổi object thành mảng để sử dụng với SectionList
        return Object.keys(grouped)
            .sort() // Sắp xếp theo thứ tự ABC
            .map((letter) => ({
                title: letter,
                data: grouped[letter],
            }));
    };
    const conTact = useMemo(() => groupUsersByFirstLetter(contact), [contact]);

    // Animation hiển thị danh sách user đã chọn
    const slideAnim = useRef(new Animated.Value(100)).current; // Giá trị ban đầu ở ngoài màn hình
    useEffect(() => {
        if (userSelecteds.length > 0) {
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
    }, [userSelecteds]);

    //Tạo nhóm
    const handleCreateGroup = async () => {
        // Kiểm tra số lượng thành viên đủ 2 chưa
        try {
            if (userSelecteds.length < 2) {
                Alert.alert(
                    "Thông báo!",
                    "Chưa đủ số lượng thành viên để tạo nhóm. Vui lòng chọn thêm thành viên để tạo nhóm!",
                    [
                        { text: "OK" }
                    ]
                );
                return;
            }

            let tenNhom = nameGroup.trim();
            //Kiểm tra tên nhóm nếu không có thì sẽ lấy tên của từng người đã chọn ghép lại
            if (nameGroup === "") {
                tenNhom = userSelecteds.map((u) => u.name).join(", ");
                // ghép thêm tên của người tạo nhóm vào cuối
                tenNhom = `${tenNhom}, ${user.name}`;
            }

            //Kiểm tra ảnh đại diện
            let fileBase64 = null;
            if (avatarGroup !== "") {
                fileBase64 = await FileSystem.readAsStringAsync(avatarGroup, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            }


            const av = {
                folderName: "group",
                fileUri: fileBase64,
                isImage: true,
            }

            //Tạo data cuộc hội thoại nhóm
            const groupChat = {
                nameGroup: tenNhom,
                admin: user?.id,
                members: userSelecteds,
                avatar: av,
            }

            // Gọi API thêm nhóm
            const res = await createConversationGroupChat(groupChat);
            if (res.success) {
                router.push({ pathname: "chatDetailScreen", params: { type: "group", convertId: res?.data?._id } })
            } else {
                console.log("Thêm thất bại!");
            }
        } catch (error) {
            console.error("Error in handleSendMessage:", error);
        }
    }

    // Formatime
    const formatTime = (messageTime) => {
        const diff = (Date.now() - new Date(messageTime)) / 1000;

        if (diff < 60) return "Vừa xong";
        if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
        if (diff < 604800) {
            const daysDiff = Math.floor(diff / 86400); // 86400 giây = 1 ngày
            return daysDiff === 0 ? "Hôm nay" : `${daysDiff} ngày trước`;
        }

        const date = new Date(messageTime);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const cleanItem = ({ time, ...rest }) => rest;

    // Chọn ảnh đại điện
    const handleAvatar = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setAvatarGroup(result.assets[0].uri)
        }
    }

    return (
        <ScreenWrapper >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => handleBackPress() || router.back()} >
                    <Icon style={styles.iconGoback} name="arrowLeft" size={32} strokeWidth={1.6} color="black" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.textNameGroup}>Nhóm mới</Text>
                    <Text style={{ color: theme.colors.textLight }}>Đã chọn: {userSelecteds.length}</Text>
                </View>
            </View>
            <View>
                <View style={styles.boxInfoGroup}>
                    <TouchableOpacity style={styles.selectAvatar} onPress={handleAvatar}>
                        {avatarGroup !== "" ? <Image source={{ uri: avatarGroup }} style={styles.avatar} /> : <Icon name="camera" size={32} strokeWidth={1.6} color="black" />}
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.inputNameGroup, isFocused && styles.inputFocused]}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Đặt tên nhóm"
                        value={nameGroup}
                        onChangeText={setNameGroup}
                    />
                    <Icon style={styles.iconTick} name="tick" size={32} strokeWidth={1.6} color={theme.colors.primaryDark} />
                </View>
            </View>
            <View style={styles.boxSearch}>
                <Icon name="search" size={24} strokeWidth={1.6} color="gray" />
                <TextInput style={styles.inputSearch} placeholder="Tìm tên hoặc số điện thoại" />
            </View>
            <View style={styles.boxSelect}>
                <TouchableOpacity onPress={() => setSelected("recent")}>
                    <Text style={selected === "recent" ? styles.textActive : styles.textNoActive}>Gần đây</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected("contact")}>
                    <Text style={selected === "contact" ? styles.textActive : styles.textNoActive}>Danh bạ</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: hp(71) }}>
                {selected === "recent" ?
                    <FlatList
                        data={recent}
                        keyExtractor={(item) => item?._id}
                        renderItem={({ item }) => {
                            // console.log(item);
                            return (
                                <TouchableOpacity style={styles.buttonUser} onPress={() => toggleSelection(cleanItem(item))}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                        <Avatar uri={item?.avatar} style={styles.avatar} />
                                        <View>
                                            <Text style={styles.textName}>{item?.name}</Text>
                                            <Text style={{ color: theme.colors.textLight, marginTop: 5 }}>{formatTime(item.time)}</Text>
                                        </View>
                                    </View>
                                    <RadioButton
                                        isSelect={userSelecteds.some(u => u._id === item._id)}
                                        size={20}
                                        color={theme.colors.primaryDark}
                                        onPress={() => toggleSelection(cleanItem(item))}
                                    />
                                </TouchableOpacity>
                            )
                        }}
                        ListFooterComponent={() => (
                            <View style={styles.listFooterComponent}>
                                <Text style={{ color: theme.colors.textLight }}>Vuốt trái để thêm những người khác</Text>
                            </View>
                        )}
                    />
                    :
                    <SectionList
                        sections={conTact}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => {
                            // console.log(item);
                            return (
                                <TouchableOpacity style={styles.buttonUser} onPress={() => toggleSelection(item)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                        <Avatar style={styles.avatar} uri={item?.avatar} />
                                        <View>
                                            <Text style={styles.textName}>{item.name}</Text>
                                            <Text style={{ color: theme.colors.textLight, marginTop: 5 }}>{ }</Text>
                                        </View>
                                    </View>
                                    <RadioButton
                                        isSelect={userSelecteds.some(u => u._id === item._id)}
                                        size={20}
                                        color={theme.colors.primaryDark}
                                        onPress={() => toggleSelection(item)}
                                    />
                                </TouchableOpacity>
                            )
                        }}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={{ fontSize: 16, fontWeight: 'bold', paddingHorizontal: 20, paddingVertical: 5 }}>{title}</Text>
                        )}
                        ListFooterComponent={() => (
                            <View style={styles.listFooterComponent}>
                                <Text style={{ color: theme.colors.textLight }}> bạn</Text>
                            </View>
                        )}
                    />
                }
            </View>
            {/* View hiển thị danh sách đã chọn */}
            {userSelecteds.length > 0 && (
                <Animated.View style={[styles.boxUsersSelected, { transform: [{ translateY: slideAnim }] }]}>
                    <FlatList
                        data={userSelecteds}
                        keyExtractor={(item) => item?._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => toggleSelection(item)}>
                                <Avatar uri={item?.avatar} style={styles.avatar} />
                                <View style={styles.cancel}>
                                    <Icon name="cancel" size={12} strokeWidth={2.6} color="white" />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.modalButton} onPress={() => handleCreateGroup()}>
                        <Icon name="arrowRight" size={32} strokeWidth={1.6} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </ScreenWrapper>
    );
};

export default NewGroup;

const styles = StyleSheet.create({
    header: {
        backgroundColor: theme.colors.gray,
        height: hp(7),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grayLight,
        flexDirection: "row",
        alignItems: "center"
    },
    iconGoback: {
        marginHorizontal: 20
    },
    textNameGroup: {
        fontSize: 18,
        fontWeight: theme.fonts.medium,
    },
    boxInfoGroup: {
        flexDirection: "row",
        alignItems: "center",
        height: hp(8)
    },
    selectAvatar: {
        marginHorizontal: 30
    },
    inputNameGroup: {
        fontSize: 18,
        width: wp(60),
    },
    iconTick: {
        margin: 20,
        display: "none"
    },
    inputFocused: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primaryDark
    },
    boxSearch: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.gray,
        height: hp(5),
        marginHorizontal: 20,
        borderRadius: theme.radius.xs,
        paddingHorizontal: 10,
        marginVertical: 5
    },
    inputSearch: {
        fontSize: 16,
        width: wp(80),
        marginLeft: 10
    },
    boxSelect: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grayLight,
        height: hp(5)
    },
    select: {
        borderBottomWidth: 1,
        borderBottomColor: "black",
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
        textAlign: "center"
    },
    textNoActive: {
        textTransform: "uppercase",
        fontSize: 14,
        color: theme.colors.textLight,
        height: "100%",
        lineHeight: hp(5),
        width: wp(25),
        textAlign: "center"
    },

    // Component friend
    buttonUser: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 20
    },
    textName: {
        fontSize: 16,
    },
    boxContactMethod: {
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: wp(20)
    },

    // Animation
    boxUsersSelected: {
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
    modalButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#007bff",
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
        borderRadius: 10
    },

    // Footer SectionList
    listFooterComponent: {
        alignItems: "center",
        height: hp(18),
        paddingTop: 10,
    }
});
