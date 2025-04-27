import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import { hp, wp } from "@/helpers/common";
import ToggleSwitch from "@/components/ToggleSwitch";
import { router, useLocalSearchParams } from "expo-router";
import Avatar from "@/components/Avatar";
import { changeSettingApproved, handleApprovedRequest } from "@/api/conversationAPI";
import { useAuth } from "@/contexts/AuthContext";

const ApprovedMembers = () => {
    const { user } = useAuth();
    const { conver } = useLocalSearchParams();
    const converInfo = JSON.parse(conver);
    const [isEnabled, setIsEnabled] = useState(converInfo?.approvedMembers || false); // Lấy trạng thái ban đầu từ converInfo

    // Thay đổi cài đặt duyệt
    const handleApproved = async () => {
        const response = await changeSettingApproved(converInfo._id);
        if (response.success) {
            setIsEnabled(response.data.approvedMembers); // Cập nhật trạng thái dựa trên phản hồi API
        } else {
            setIsEnabled(!isEnabled); // Hoàn nguyên trạng thái nếu thất bại
        }
    };

    // Duyệt or xóa thành viên
    const handleApproveMember = async (member, type) => {
        const response = await handleApprovedRequest(converInfo._id, member?._id, user?.id, type);
        if (response.success) {
            Alert.alert(type === "approve" ? `Đã duyệt ${member?.name} vào nhóm!` : `Xóa yêu cầu tham gia của ${member?.name}!`);
        } else {
            Alert.alert(type === "approve" ? "Duyệt thành viên không thành công!" : "Xóa yêu cầu tham gia không thành công!");
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
                    <Text style={styles.textTitleHeader}>Duyệt thành viên</Text>
                </View>
            </View>

            {/* Body */}
            <View style={{ height: hp(7), justifyContent: "center", paddingHorizontal: 20 }}>
                <Text style={{ color: theme.colors.primary }}>Cài đặt chung</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, height: hp(9) }}>
                <View style={{ width: "70%", justifyContent: "space-evenly", height: "100%" }}>
                    <Text style={{ fontSize: 18 }}>Duyệt thành viên</Text>
                    <Text style={{ color: "gray" }}>Khi bật, yêu cầu tham gia phải được duyệt bởi trưởng nhóm</Text>
                </View>
                <ToggleSwitch isEnabled={isEnabled} setIsEnabled={setIsEnabled} onPress={handleApproved} />
            </View>
            <View>
                <FlatList
                    data={converInfo?.listApprovedMembers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.buttonItem}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Avatar uri={item?.avatar} style={styles.avatar} />
                                <Text style={styles.textName}>{item?.name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "30%" }}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={() => handleApproveMember(item, "approve")}>
                                    <Text style={{ color: "white" }}>Duyệt</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={() => handleApproveMember(item, "delete")}>
                                    <Text style={{ color: "white" }}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
};

export default ApprovedMembers;

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
        fontWeight: theme.fonts.medium
    },
    button: {
        width: wp(12),
        height: hp(3),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: wp(6)
    }
});