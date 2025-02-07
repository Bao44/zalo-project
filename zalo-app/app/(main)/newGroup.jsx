import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Image, SectionList, Animated, Alert, BackHandler } from "react-native";
import React, { useEffect, useRef, useCallback } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { useState } from "react";
import users from "../../assets/dataLocals/UserLocal";
import RadioButton from "../../components/RadioButton";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";


const NewGroup = () => {
    const [amount, setAmount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [selected, setSelected] = useState("recent");
    const [recent, setRecent] = useState(users);
    const [selectedIds, setSelectedIds] = useState([]);
    const [userSelecteds, setUserSelecteds] = useState([]);
    const [nameGroup, setNameGroup] = useState("");
    const [search, setSearch] = useState("");

    //back to previous screen
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
    const toggleSelection = (id) => {
        setSelectedIds((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]
        );
        setUserSelecteds((prevUserSelected) =>
            prevUserSelected.some((item) => item.id === id)
                ? prevUserSelected.filter((item) => item.id !== id)
                : [...prevUserSelected, users.find((item) => item.id === id)]
        );
        setAmount((prevAmount) => (selectedIds.includes(id) ? prevAmount - 1 : prevAmount + 1));
    };

    // Nhóm người dùng theo chữ cái đầu tiên
    const groupUsersByFirstLetter = (users) => {
        const grouped = users.reduce((acc, user) => {
            const firstLetter = user.name[0].toUpperCase(); // Lấy chữ cái đầu tiên
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(user);
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

    // Lấy danh sách người dùng đã nhóm theo chữ cái đầu tiên
    const groupedUsers = groupUsersByFirstLetter(users);

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

    return (
        <ScreenWrapper >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => handleBackPress() || router.back()} >
                    <Icon style={styles.iconGoback} name="arrowLeft" size={32} strokeWidth={1.6} color="black" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.textNameGroup}>Nhóm mới</Text>
                    <Text style={{ color: theme.colors.textLight }}>Đã chọn: {amount}</Text>
                </View>
            </View>
            <View>
                <View style={styles.boxInfoGroup}>
                    <TouchableOpacity style={styles.selectAvatar}>
                        <Icon name="camera" size={32} strokeWidth={1.6} color="black" />
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
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <TouchableOpacity style={styles.buttonUser} onPress={() => toggleSelection(item.id)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                        <Image style={styles.avatar} source={{ uri: item.avatar }} />
                                        <View>
                                            <Text style={styles.textName}>{item.name}</Text>
                                            <Text style={{ color: theme.colors.textLight, marginTop: 5 }}>1 day ago</Text>
                                        </View>
                                    </View>
                                    <RadioButton
                                        isSelect={isSelected}
                                        size={20}
                                        color={theme.colors.primaryDark}
                                        onPress={() => toggleSelection(item.id)}
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
                        sections={groupedUsers}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <TouchableOpacity style={styles.buttonUser} onPress={() => toggleSelection(item.id)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                        <Image style={styles.avatar} source={{ uri: item.avatar }} />
                                        <View>
                                            <Text style={styles.textName}>{item.name}</Text>
                                            <Text style={{ color: theme.colors.textLight, marginTop: 5 }}>1 day ago</Text>
                                        </View>
                                    </View>
                                    <RadioButton
                                        isSelect={isSelected}
                                        size={20}
                                        color={theme.colors.primaryDark}
                                        onPress={() => toggleSelection(item.id)}
                                    />
                                </TouchableOpacity>
                            )
                        }}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={{ fontSize: 16, fontWeight: 'bold', paddingHorizontal: 20, paddingVertical: 5 }}>{title}</Text>
                        )}
                        ListFooterComponent={() => (
                            <View style={styles.listFooterComponent}>
                                <Text style={{ color: theme.colors.textLight }}>{groupedUsers.length} bạn</Text>
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
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => toggleSelection(item.id)}>
                                <Image style={styles.avatar} source={{ uri: item.avatar }} />
                                <View style={styles.cancel}>
                                    <Icon name="cancel" size={12} strokeWidth={2.6} color="white" />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.modalButton}>
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
