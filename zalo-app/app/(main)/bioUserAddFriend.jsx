import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Icon from "../../assets/icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { theme } from "../../constants/theme";
import { checkFriendship, sendFriendRequest } from "../../api/friendshipAPI";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import { hp, wp } from "../../helpers/common";
import { getUserFromMongoDB } from "../../api/user";

const BioUser = () => {
    const router = useRouter();
    const pagrams = useLocalSearchParams();
    const friend = JSON.parse(pagrams.user);
    const { user } = useAuth();
    const type = pagrams.type;
    const [friended, setFriended] = useState(false);
    const [infoUser, setInfoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, friendResponse] = await Promise.all([
                    getUserFromMongoDB(friend?._id),
                    checkFriendship(user.id, friend?._id)
                ]);

                if (userResponse.success) setInfoUser(userResponse?.user);
                setFriended(friendResponse.success);
            } catch (error) {
                console.log("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSendFriendRequest = async () => {
        try {
            const content = `Chào bạn, mình là ${user.name}. Mình biết bạn qua số điện thoại. Kết bạn với mình nhé!`;
            const response = await sendFriendRequest(user.id, friend?._id, content, type);
            alert(response.success ? "Đã gửi yêu cầu kết bạn!" : "Đã xảy ra lỗi khi gửi yêu cầu kết bạn!");
        } catch (error) {
            console.log("Lỗi gửi yêu cầu kết bạn:", error);
        }
    };

    const handleSendMessage = () => {
        router.push({ pathname: "chatDetailScreen", params: { type: "private", data: JSON.stringify(infoUser) } });
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.container}>
                    <Text>Đang tải...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!friend) {
        return (
            <ScreenWrapper>
                <View style={styles.container}>
                    <Text>Không tìm thấy thông tin người dùng</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Icon name="arrowLeft" size={24} strokeWidth={1.6} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.moreButton}>
                            <Icon name="phone" size={24} strokeWidth={1.6} color="#000" />
                        </TouchableOpacity>
                        {friended && (
                            <TouchableOpacity style={styles.moreButton}>
                                <Icon name="userSetting" size={24} strokeWidth={1.6} color="#000" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.moreButton}>
                            <Icon name="moreHorizontal" size={24} strokeWidth={1.6} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Avatar uri={friend?.avatar} size={hp(13)} rounded={theme.radius.xxl * 100} />
                        </View>
                    </View>

                    <View style={styles.bioTextContainer}>
                        <Text style={styles.bioText}>{friend?.name}</Text>
                        <TouchableOpacity>
                            <Icon name="edit" size={20} color="#666" style={styles.editIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.boxText}>
                        {friended ? (
                            <Text style={styles.text}>
                                {friend?.name} chưa có hoạt động nào. Hãy trò chuyện để hiểu nhau hơn.
                            </Text>
                        ) : (
                            <Text style={styles.text}>
                                Bạn chưa thể xem nhật ký của {friend?.name} khi chưa là bạn bè
                            </Text>
                        )}
                    </View>

                    {(!friended && friend?._id !== user?.id)&& (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%' }}>
                            <TouchableOpacity style={styles.buttonSendMess}>
                                <Icon name="message" size={24} color={theme.colors.primary} />
                                <Text style={{ color: theme.colors.primary, marginLeft: 10, fontSize: 14, fontWeight: theme.fonts.medium }}>
                                    Nhắn tin
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonAddFriend} onPress={handleSendFriendRequest}>
                                <Icon name="userAdd" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    )}
                    {friend?._id === user?.id && ""}
                </View>

                {friended && (
                    <TouchableOpacity style={styles.buttonSendMessFriended} onPress={handleSendMessage}>
                        <Icon name="message" size={24} color={theme.colors.primary} />
                        <Text style={{ color: theme.colors.primary, marginLeft: 10, fontSize: 14, fontWeight: theme.fonts.medium }}>
                            Nhắn tin
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56
    },
    headerRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    backButton: { padding: 8 },
    moreButton: {
        paddingVertical: hp(2),
        paddingHorizontal: wp(3)
    },
    profileSection: { alignItems: 'center' },
    avatarContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -50
    },
    bioTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 20
    },
    editIcon: { marginLeft: 8 },
    bioText: {
        fontSize: 18,
        color: '#000',
        fontWeight: theme.fonts.medium
    },
    boxText: {
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    text: {
        width: '80%',
        textAlign: 'center',
        fontSize: 14
    },
    buttonSendMess: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#94AAD6",
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
        width: '70%'
    },
    buttonAddFriend: {
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
        backgroundColor: "#fff",
        width: '15%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonSendMessFriended: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
        width: wp(30),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        alignSelf: 'flex-end',
        marginBottom: hp(6),
        marginRight: wp(6),
        position: "absolute",
        right: 0,
        bottom: 0
    },
});

export default BioUser;