import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import { hp, wp } from "../helpers/common";

const MessageOptionsModal = ({ visible, onClose, onReply, onForward, onDelete, onRecall, isSender, isLike, onLike, onDisLike, isRevoked }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContainer}>
                    {!isRevoked && (
                        <>
                            <TouchableOpacity style={styles.option} onPress={onReply}>
                                <Icon name="reply" size={24} color={theme.colors.dark} />
                                <Text style={styles.optionText}>Trả lời</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.option} onPress={onForward}>
                                <Icon name="forward" size={24} color={theme.colors.dark} />
                                <Text style={styles.optionText}>Chuyển tiếp</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={styles.option} onPress={onDelete}>
                        <Icon name="delete" size={24} color={theme.colors.dark} />
                        <Text style={styles.optionText}>Xóa</Text>
                    </TouchableOpacity>
                    {isSender && !isRevoked && (
                        <TouchableOpacity style={styles.option} onPress={onRecall}>
                            <Icon name="eyeHide" size={24} color={theme.colors.dark} />
                            <Text style={styles.optionText}>Thu hồi</Text>
                        </TouchableOpacity>
                    )}
                    {isLike && !isRevoked && (
                        <TouchableOpacity style={styles.option} onPress={onDisLike}>
                            <Icon name="heartRemove" size={24} color={theme.colors.dark} />
                            <Text style={styles.optionText}>Bỏ thích</Text>
                        </TouchableOpacity>
                    )}
                    {!isLike && !isRevoked && (
                        <TouchableOpacity style={styles.option} onPress={onLike}>
                            <Icon name="heart" size={24} color={theme.colors.dark} />
                            <Text style={styles.optionText}>Thích</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingVertical: 10,
        width: wp(60),
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    optionText: {
        fontSize: 16,
        color: theme.colors.dark,
        marginLeft: 10,
    },
});

export default MessageOptionsModal;