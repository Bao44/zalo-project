import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '@/constants/theme';
import Icon from '@/assets/icons';
import Avatar from '@/components/Avatar';
import { hp, wp } from '@/helpers/common';
import { removeMemberFromGroup } from '@/api/conversationAPI';


const { height } = Dimensions.get('window');

const MemberInfoModal = ({ visible, onClose, member, admin, conver_id, user_id }) => {
    if (!member) return null;

    // Xoa thanh vien khoi nhom
    const handleRemoveMember = async () => {
        try {
            console.log("Xoa thanh vien khoi nhom", member?._id, user_id);
            console.log("ID nhom", conver_id);
            const response = await removeMemberFromGroup(conver_id, member?._id, user_id);
            if (response.success) {
                alert("Xóa thành viên thành công!");
            }
        } catch (error) {
            alert("Xóa thành viên không thành công!");
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Thông tin thành viên</Text>
                        <TouchableOpacity onPress={onClose} style={{ position: "absolute", right: 10 }}>
                            <Icon
                                name="cancel"
                                size={24}
                                strokeWidth={1.6}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Avatar
                                uri={member?.avatar}
                                size={80}
                                style={styles.avatar}
                            />
                            <Text style={styles.name}>{member?.name}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "25%" }}>
                            <TouchableOpacity style={{
                                backgroundColor: theme.colors.gray,
                                justifyContent: "center",
                                alignItems: "center",
                                width: wp(10),
                                height: wp(10),
                                borderRadius: wp(5),
                            }}>
                                <Icon name="phone" size={22} color="gray" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                backgroundColor: theme.colors.gray,
                                justifyContent: "center",
                                alignItems: "center",
                                width: wp(10),
                                height: wp(10),
                                borderRadius: wp(5),
                            }}
                            >
                                <Icon name="message" size={22} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Option */}
                    <View>
                        <TouchableOpacity style={styles.infoRow}>
                            <Text style={{ fontSize: 16 }}>Xem trang cá nhân</Text>
                        </TouchableOpacity>
                        {admin && (
                            <TouchableOpacity style={styles.infoRow} onPress={handleRemoveMember}>
                                <Text style={{ fontSize: 16, color: "red" }}>Xóa khỏi nhóm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: height * 0.4,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: theme.fonts.semibold,
        color: theme.colors.dark,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: "gray",
        paddingVertical: 10,
    },
    avatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(8),
    },
    name: {
        fontSize: 18,
        fontWeight: theme.fonts.bold,
        color: theme.colors.dark,
        marginBottom: 5,
        marginLeft: 10,
    },
    role: {
        fontSize: 14,
        color: theme.colors.gray,
        marginBottom: 15,
    },
    infoRow: {
        width: '100%',
        height: hp(6),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: 10,
    },
    infoText: {
        fontSize: 16,
        color: theme.colors.dark,
    },
});

export default MemberInfoModal;