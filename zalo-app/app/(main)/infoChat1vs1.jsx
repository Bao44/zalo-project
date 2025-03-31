import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Alert } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { hp, wp } from "@/helpers/common";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { deleteConversation1vs1 } from "@/api/conversationAPI";
import { getUserFromMongoDB } from "@/api/user";

const InfoChat1vs1 = () => {
    const { user } = useAuth();
    const { conversationId, friend } = useLocalSearchParams();
    const friendInfo = JSON.parse(friend);
    const [data, setData] = useState([]);
    //LAY DATA FROM API

    // XÓA CUỘC TRÒ CHUYỆN
    const handleDelete = () => {
        // Hỏi người dùng có chắc chắn muốn xóa không
        Alert.alert(`Xóa cuộc trò chuyện với ${friendInfo?.name}?`, "Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?", [
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
                                router.back();
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

    //CHUYỂN ĐẾN TRANG CÁ NHÂN CỦA BẠN BÈ
    const handleInfo = async () => {
        const info = await getUserFromMongoDB(friendInfo?._id);
        if (info) {
           router.push({pathname: "bioUserAddFriend", params: {user: JSON.stringify(info)}});
        } else {
            Alert.alert("Lỗi", info?.data.message || "Không thể tìm thấy thông tin người dùng.");
        }
    };

    return (
        <ScreenWrapper>
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
            <ScrollView>
                <View style={styles.container1}>
                    <Avatar uri={friendInfo?.avatar} size={90} rounded={45} />
                    <Text style={styles.textName}>{friendInfo?.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-evenly', height: "30%", width: "100%" }}>
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
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
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }} onPress={handleInfo}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="profile"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Trang cá nhân</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
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
                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
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
                <View style={styles.container2}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="edit"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Đổi tên gọi nhớ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="star"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Đánh dấu bạn thân</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="information"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Nhật ký chung</Text>
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
                            name="addGroup"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Tạo nhóm với {friendInfo?.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="userAdd"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Thêm {friendInfo?.name} vào nhóm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="userMultiple"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Xem nhóm chung { }</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.container4}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="pin"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Ghim trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="eyeHide"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Ẩn trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="callInComing"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Báo cuộc gọi đến</Text>
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
                <View style={styles.container5}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="report"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Báo xấu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="block"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Quản lý chặn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="cloud"
                            size={24}
                            strokeWidth={1.6}
                            color="gray"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Dung lượng trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box} onPress={handleDelete}>
                        <Icon
                            name="delete"
                            size={24}
                            strokeWidth={1.6}
                            color="red"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17, color: "red" }}>Xóa lịch sử trò chuyện</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default InfoChat1vs1;

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
