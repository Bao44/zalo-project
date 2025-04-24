import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Alert, Image } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { hp, wp } from "@/helpers/common";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { deleteConversation1vs1, getConversation, updateAvataConversation } from "@/api/conversationAPI";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const InfoChatGroup = () => {
    const { user } = useAuth();
    const { conversationId } = useLocalSearchParams();
    const [conversationInfo, setConversationInfo] = useState({});
    const [data, setData] = useState([]);

    // LẤY THÔNG TIN CUỘC TRÒ CHUYỆN
    useEffect(() => {
        const fetchConversationInfo = async () => {
            try {
                const response = await getConversation(conversationId);
                if (response.success) {
                    setConversationInfo(response.data);
                }
            } catch (error) {
                console.error("Error fetching conversation info:", error);
            }
        };
        fetchConversationInfo();
    }, [conversationId]);

    // XÓA CUỘC TRÒ CHUYỆN
    const handleDelete = () => {
        // Hỏi người dùng có chắc chắn muốn xóa không
        Alert.alert(`Xóa lịch sử cuộc trò chuyện nhóm?`, "Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện này không?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Xóa",
                onPress: () => {
                    // Xóa cuộc trò chuyện
                    deleteConversation1vs1(conversationId, user?.id)
                        .then((res) => {
                            if (res.success) {
                                Alert.alert("Thành công", "Cuộc trò chuyện đã được xóa thành công.");
                                router.push("home");
                            } else {
                                Alert.alert("Lỗi", res.data.message || "Không thể xóa cuộc trò chuyện.");
                            }
                        })
                        .catch((error) => {
                            Alert.alert("Lỗi", error.message || "Không thể xóa cuộc trò chuyện.");
                        });
                },
            },
        ]);
    };

    // CÂP NHẬT AVATAR CUỘC TRÒ CHUYỆN
    const handleUpdateAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

            const avatarData = {
                folderName: "group",
                fileUri: fileBase64,
                isImage: true,
            };
            const response = await updateAvataConversation(conversationId, avatarData);
            if (response.success) {
                setConversationInfo((prev) => ({ ...prev, avatar: response.data.avatar }));
            } else {
                Alert.alert("Lỗi", response.data.message || "Không thể cập nhật avatar.");
            }
        };
    }

    //Thay đổi admin nhóm
    const handleChangeAdmin = async () => {
        try {
            // Kiểm tra xem người dùng có phải là admin không
            const isAdmin = conversationInfo?.admin === user?.id;
            if (!isAdmin) {
                Alert.alert("Cảnh báo", "Bạn không có quyền thay đổi admin nhóm này.");
                return;
            }
            // Alert cho người dùng xác nhận
            Alert.alert("Chuyển quyền trưởng nhóm", "Người được chọn sẽ trở thành trưởng nhóm và có mọi quyền quản lý nhóm. Bạn sẽ mất quyền quản lý nhưng vẫn là một thành viên của nhóm. Hành động này không thể phục hồi", [
                {
                    text: "Hủy",
                    style: "cancel",
                },
                {
                    text: "Tiếp tục",
                    onPress: async () => {
                        // Gọi sang màn hình khác để chọn admin mới
                        router.push({ pathname: "seleteAdminGroup", params: { conver: JSON.stringify(conversationInfo) } });
                    },
                },
            ]);
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể thay đổi quyền admin.");
        }
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.container}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Icon
                            name="arrowLeft"
                            size={24}
                            strokeWidth={1.6}
                            color={theme.colors.darkLight}
                        />
                    </TouchableOpacity>
                    <Text style={styles.textTitleHeader}>Tùy chọn</Text>
                </View>
            </View>

            {/* Body */}
            <ScrollView>
                <View style={styles.container1}>
                    <TouchableOpacity onPress={handleUpdateAvatar} style={{ alignItems: "center", justifyContent: "center" }}>
                        <Image
                            source={{ uri: conversationInfo?.avatar }}
                            style={{ width: wp(20), height: wp(20), borderRadius: wp(10) }}
                        />
                        <View style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.grayLight, width: wp(8), height: wp(8), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                            <Icon
                                name="camera"
                                size={16}
                                strokeWidth={1.6}
                                color="black"

                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.textName} numberOfLines={1} ellipsizeMode="tail">{conversationInfo?.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-evenly', height: "30%", width: "100%" }}>
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: "17%" }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="search"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Tìm tin nhắn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: "17%" }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="addGroup"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Thêm thành viên</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: "17%" }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="zTyle"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Đổi hình nền</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: "17%" }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="notification"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Tắt thông báo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.container2, { height: hp(7) }]}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="edit"
                            size={20}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Thêm thông tin mô tả</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.container3}>
                    <View style={styles.box}>
                        <Icon
                            name="imageFile"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Ảnh, file, link</Text>
                    </View>
                    <View style={[styles.box, { alignItems: "center", justifyContent: "center" }]}>
                        {data.length > 0 ? (
                            <FlatList
                                data={data}
                                renderItem={({ item }) => (
                                    <View style={{ marginLeft: 20 }}>
                                        <Text>{item.name}</Text>
                                    </View>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                            />
                        ) : (
                            <Text style={{ marginLeft: 20 }}>Chưa dữ liệu nào</Text>
                        )}
                    </View>
                </TouchableOpacity>
                <View style={styles.container2}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="calendar"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Lịch nhóm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="pin"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Tin nhắn đã ghim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="chart"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Bình chọn</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.container2, { height: hp(7) }]}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="setting"
                            size={20}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Cài đặt nhóm</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.container2}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="userGroup"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Xem thành viên ({conversationInfo?.members?.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="tick"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Duyệt thành viên</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="link"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Link nhóm</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.container5}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="pin"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Ghim cuộc trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="eyeHide"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Ẩn cuộc trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="alarmClock"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <View style={{ marginLeft: 20 }}>
                            <Text style={{ fontSize: 17 }}>Tin nhắn tự xóa</Text>
                            <Text style={{ fontSize: 15, color: "gray" }}>Không tự xóa</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="userSetting"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Cài đặt cá nhân</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.container4, { height: conversationInfo?.admin === user?.id ? hp(40) : hp(25) }]}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="report"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Báo xấu</Text>
                    </TouchableOpacity>
                    {conversationInfo?.admin === user?.id && (
                        <TouchableOpacity style={styles.box} onPress={handleChangeAdmin}>
                            <Icon
                                name="key"
                                size={24}
                                strokeWidth={1.6}
                                color="gray"
                            />
                            <Text style={{ marginLeft: 20, fontSize: 17 }}>Chuyển quyền trưởng nhóm</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="cloud"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Dung lượng trò truyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box} onPress={handleDelete}>
                        <Icon
                            name="delete"
                            size={24}
                            strokeWidth={1.6}
                            color="red"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17, color: "red" }}>Xóa lịch sử trò truyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="leaveGroup"
                            size={24}
                            strokeWidth={1.6}
                            color="red"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17, color: "red" }}>Rời nhóm</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default InfoChatGroup;

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primaryLight,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    textTitleHeader: {
        fontSize: 18,
        fontWeight: theme.fonts.medium,
        color: theme.colors.darkLight,
        marginLeft: 10,
    },

    // Container 1
    container1: {
        alignItems: "center",
        justifyContent: "space-evenly",
        height: hp(35),
        backgroundColor: "#fff",
    },
    textName: {
        fontSize: 20,
        fontWeight: theme.fonts.medium,
        width: "60%"
    },

    // Container 2
    container2: {
        backgroundColor: "#fff",
        height: hp(25),
        justifyContent: "space-evenly",
        paddingHorizontal: 20,
        marginTop: 10,
    },
    box: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    // Container 3
    container3: {
        backgroundColor: "#fff",
        height: hp(15),
        justifyContent: "space-evenly",
        paddingHorizontal: 20,
        marginTop: 10,
    },

    // Container 4
    container4: {
        backgroundColor: "#fff",
        height: hp(40),
        justifyContent: "space-evenly",
        paddingHorizontal: 20,
        marginTop: 10,
    },

    // Container 5
    container5: {
        backgroundColor: "#fff",
        height: hp(30),
        justifyContent: "space-evenly",
        paddingHorizontal: 20,
        marginTop: 10,
    },
});