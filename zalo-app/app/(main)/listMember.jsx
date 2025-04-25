import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import { hp, wp } from "@/helpers/common";
import { router, useLocalSearchParams } from "expo-router";
import Avatar from "@/components/Avatar";
import { addMemberToGroup, changeSettingApproved, removeMemberFromGroup } from "@/api/conversationAPI";
import MemberInfoModal from "@/components/MemberInfoModal";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessage } from "@/api/messageAPI";

const ListMember = () => {
    const { user } = useAuth();
    const { conver } = useLocalSearchParams();
    const converInfo = JSON.parse(conver);
    const [selectedMember, setSelectedMember] = useState(null); // State để lưu thành viên được chọn
    const [modalVisible, setModalVisible] = useState(false); // State để điều khiển modal

    //Duyet thanh vien
    const handleApprovedMember = async () => {
        router.push({ pathname: "approvedMembers", params: { conver: JSON.stringify(converInfo) } })
    }

    // Mở modal khi nhấn vào thành viên
    const handleOpenModal = (member) => {
        setSelectedMember(member);
        setModalVisible(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedMember(null);
    };

    // Xoa thành viên khỏi nhóm
    const handleRemoveMember = async () => {
        try {
            const response = await removeMemberFromGroup(converInfo._id, selectedMember?._id, user?.id);
            if (response.success) {
                //Gửi tin nhắn thông báo cho thành viên bị xóa
                const messageData = {
                    senderId: user?.id,
                    content: `${selectedMember?.name} đã bị xóa khỏi nhóm!`,
                    attachments: null,
                    media: null,
                    file: null,
                    replyTo: null,
                    type: "notification",
                };
                await sendMessage(converInfo._id, messageData);
                setModalVisible(false);
                setSelectedMember(null);
                Alert.alert("Xóa thành viên thành công!");
            } else {
                Alert.alert("Xóa thành viên không thành công!");
            }
        } catch (error) {
            Alert.alert("Xóa thành viên không thành công!");
            return error.response.data.error || "Lỗi không xác định từ server";
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
                    <Text style={styles.textTitleHeader}>Quản lý thành viên</Text>
                </View>
            </View>

            {/* Body */}
            {converInfo?.admin === user?.id && (
                <TouchableOpacity style={{
                    width: "100%",
                    height: hp(7),
                    justifyContent: "flex-start",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    flexDirection: 'row'
                }}
                    onPress={handleApprovedMember}
                >
                    <View style={{ width: wp(10), height: wp(10), borderRadius: wp(5), backgroundColor: theme.colors.grayLight, justifyContent: "center", alignItems: "center" }}>
                        <Icon
                            name="tick"
                            size={24}
                            strokeWidth={1.6}
                            color={theme.colors.primary}
                        />
                    </View>
                    <Text style={{ paddingLeft: 20, fontSize: 16 }}>Duyệt thành viên</Text>
                </TouchableOpacity>
            )}
            <View>
                <View style={{
                    width: "100%",
                    height: hp(7),
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                }}>
                    <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: theme.fonts.medium }}>Thành viên ({converInfo?.members?.length})</Text>
                    <TouchableOpacity><Icon name="moreHorizontal" size={24} strokeWidth={1.6} color="gray" /></TouchableOpacity>
                </View>
                <FlatList
                    data={converInfo?.members}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.buttonItem} onPress={() => handleOpenModal(item)}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Avatar
                                    uri={item?.avatar}
                                    size={50}
                                    style={styles.avatar}
                                />
                                <View>
                                    <Text style={styles.textName}>{item.name}</Text>
                                    {item?._id === converInfo?.admin ? (
                                        <Text style={{ fontSize: 12, color: theme.colors.rose, marginTop: 5 }}>Trưởng nhóm</Text>
                                    ) : (
                                        <Text style={{ fontSize: 12, color: "gray", marginTop: 5 }}>Thành viên</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
            {/* Modal hiển thị thông tin thành viên */}
            <MemberInfoModal
                visible={modalVisible}
                onClose={handleCloseModal}
                member={selectedMember}
                admin={converInfo?.admin === user?.id && selectedMember?._id !== converInfo?.admin}
                conver_id={converInfo?._id}
                user_id={user?.id}
                handleRemoveMember={handleRemoveMember}
            />
        </ScreenWrapper>
    );
};

export default ListMember;

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