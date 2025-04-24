import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import { useLocalSearchParams, router } from "expo-router";
import Avatar from "@/components/Avatar";
import { changeAdminGroup } from "@/api/conversationAPI";

const seleteAdminGroup = () => {
    const params = useLocalSearchParams();
    const { conver } = params;
    const paramData = JSON.parse(conver);
    const { _id, members, admin } = paramData;

    const handleChangeAdmin = async (newAdmin) => {
        try {
            // Alert trước khi thực hiện thay đổi admin
            Alert.alert(
                "Xác nhận thay đổi admin",
                `Bạn có chắc chắn muốn thay đổi trưởng nhóm thành ${newAdmin.name} không?`,
                [
                    {
                        text: "Hủy",
                        style: "cancel",
                    },
                    {
                        text: "Đồng ý",
                        onPress: async () => {
                            const response = await changeAdminGroup(_id, newAdmin._id);
                            if (response.success) {
                                Alert.alert("Thành công", "Đã thay đổi trưởng nhóm thành công!");
                                router.back();
                            } else {
                                Alert.alert("Lỗi", response.data.message || "Có lỗi xảy ra!");
                            }
                        },
                    },
                ]
            );
        }
        catch (error) {
            console.error("Lỗi khi thay đổi admin:", error.message);
        }
    }

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
                    <Text style={styles.textTitleHeader}>Chọn trưởng nhóm mới</Text>
                </View>
            </View>

            {/* Body */}
            <View>
                <FlatList
                    data={members.filter((member) => member._id !== admin)}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.box} onPress={() => handleChangeAdmin(item)}>
                            <Avatar uri={item?.avatar} style={styles.avatar}/>
                            <Text style={styles.textName}>{item?.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
};

export default seleteAdminGroup;

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
    box: {
        flexDirection: "row",
        alignItems: "center",
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
        fontWeight: theme.fonts.medium,
        marginLeft: 10,
    },
});
