import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Icon from "../../assets/icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { theme } from "../../constants/theme";
import { sendFriendRequest } from "../../api/friendshipAPI";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import { hp } from "../../helpers/common";

const BioUser = () => {
    const router = useRouter();
    const pagrams = useLocalSearchParams();
    const friend = JSON.parse(pagrams.user);
    const { user, setAuth } = useAuth();
    const type = pagrams.type;

    //Gửi yêu cầu kết bạn
    const handleSendFriendRequest = async () => {
        try {
            const content = "Chào bạn, mình là " + user.name + ". Mình biết bạn qua số điện thoại. Kết bạn với mình nhé!";
            const response = await sendFriendRequest(user.id, friend[0].supabaseId, content, type);
            if (response.success) {
                alert("Đã gửi yêu cầu kết bạn!");
            } else {
                alert("Đã xảy ra lỗi khi gửi yêu cầu kết bạn!");
                return response.data;
            }
        } catch (error) {
            console.log("Lỗi gửi yêu cầu kết bạn:", error);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Icon name="arrowLeft" size={24} strokeWidth={1.6} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity>
                            <Icon name="phone" size={24} strokeWidth={1.6} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreButton}>
                            <Icon name="moreHorizontal" size={24} strokeWidth={1.6} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Avatar
                                uri={friend[0]?.avatar}
                                size={hp(13)}
                                rounded={theme.radius.xxl * 100}
                            />
                        </View>
                    </View>

                    {/* Bio Update Text */}
                    <View style={styles.bioTextContainer}>
                        <Text style={styles.bioText}>{friend[0].name}</Text>
                        <TouchableOpacity>
                            <Icon name="edit" size={20} color="#666" style={styles.editIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.boxText}>
                        <Text style={styles.text}>Bạn chưa thể xem nhật ký của {friend[0].name} khi chưa là bạn bè</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%' }}>
                        <TouchableOpacity style={styles.buttonSendMess}>
                            <Icon name="message" size={24} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, marginLeft: 10, fontSize: 14, fontWeight: theme.fonts.medium }}>
                                Nhắn tin
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            padding: 10,
                            borderRadius: 20,
                            marginTop: 20,
                            backgroundColor: "#fff",
                            width: '15%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }} onPress={handleSendFriendRequest}>
                            <Icon name="userAdd" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default BioUser;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
    },
    headerRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 70,
    },
    backButton: {
        padding: 8,
    },
    moreButton: {
        padding: 8,
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -50,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    bioTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 20,
    },
    editIcon: {
        marginLeft: 8,
    },
    bioText: {
        fontSize: 18,
        color: '#000',
        fontWeight: theme.fonts.medium,
    },
    boxText: {
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    text: {
        width: '80%',
        textAlign: 'center',
        fontSize: 14,
    },
    buttonSendMess: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#94AAD6",
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
        width: '70%',
    }
});