import { StyleSheet, Text, View, TouchableOpacity, Image, SectionList, } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { hp, wp } from "../../helpers/common";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { getFriendRequests, respondToFriendRequest } from "../../api/friendshipAPI";
import Avatar from "../../components/Avatar";
import socket from "../../utils/socket";

const FriendRequest = () => {

    const [selected, setSelected] = useState("received");
    const [listFriendRequest, setListFriendRequest] = useState([]);
    const [reload, setReload] = useState(0);

    const reloadRequest = () => {
        setReload(reload + 1);
    };

    const { user } = useAuth();

    // Lấy danh sách lời mời kết bạn
    useEffect(() => {
        const fetchFriendRequest = async () => {
            try {
                const response = await getFriendRequests(user.id);
                if (response.success) {
                    setListFriendRequest(response.data);
                } else {
                    alert("Lỗi lấy danh sách lời mời kết bạn!");
                }
            } catch (error) {
                console.log("Lỗi lấy danh sách lời mời kết bạn:", error);
            }
        }
        fetchFriendRequest();
    }, [reload]);

    // Khởi tạo Socket.IO
    useEffect(() => {
        // Báo cho server rằng user đang online
        socket.emit("user-online", user.id);

        // Lắng nghe thông báo lời mời kết bạn mới
        socket.on("friend-request-notification", (data) => {
            reloadRequest(); // Tải lại danh sách lời mời
        });

        // Cleanup khi component unmount
        return () => {
            socket.off("friend-request-notification");
        };
    }, []);

    //Đồng ý hoặc từ chối yêu cầu kết bạn
    const handleRespondToFriendRequest = async (senderId, status) => {
        try {
            const response = await respondToFriendRequest(senderId, user.id, status);
            if (response.success) {
                alert("Đã xử lý yêu cầu kết bạn!");
                reloadRequest();
            } else {
                alert("Đã xảy ra lỗi khi xử lý yêu cầu kết bạn!");
            }
        } catch (error) {
            console.log("Lỗi xử lý yêu cầu kết bạn:", error);
        }
    };

    // Trạng thái mở rộng nội dung
    const [expanded, setExpanded] = useState({});

    const renderContent = (text, id) => {
        const maxLength = wp(14); // Số ký tự tối đa trước khi cắt
        if (expanded[id] || text.length <= maxLength) {
            return text; // Hiển thị toàn bộ nội dung nếu đã mở rộng hoặc nội dung ngắn
        }
        return text.substring(0, maxLength) + "... ";
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Icon
                            name="arrowLeft"
                            size={28}
                            strokeWidth={1.6}
                            color={theme.colors.darkLight}
                        />
                    </TouchableOpacity>
                    <Text style={styles.textTitleHeader}>Lời mời kết bạn</Text>
                </View>
                <Icon name="setting" size={28} color={theme.colors.darkLight} />
            </View>
            <View style={styles.boxSelect}>
                <TouchableOpacity onPress={() => setSelected("received")}>
                    <Text style={selected === "received" ? styles.textActive : styles.textNoActive}>Đã nhận ({listFriendRequest.reduce((count, month) => count + month.data.length, 0)})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected("sent")}>
                    <Text style={selected === "sent" ? styles.textActive : styles.textNoActive}>Đã gửi</Text>
                </TouchableOpacity>
            </View>
            <SectionList
                sections={listFriendRequest} // Nhóm user theo tháng
                keyExtractor={(item, index) => `${item.id}-${index}`} // Tránh key trùng lặp
                renderItem={({ item, section }) => (
                    <TouchableOpacity style={styles.buttonUser}>
                        <Avatar uri={item.sender?.avatar} size={hp(6.5)} rounded={theme.radius.xxl * 100} />
                        <View style={styles.boxContent}>
                            <Text style={styles.textNameUser}>{item.sender?.name}</Text>
                            {section.title !== "Cũ hơn" ? (
                                <>
                                    <Text style={styles.textDateRequest}>
                                        {String(new Date(item.createdAt).getDate()).padStart(2, "0")}/
                                        {String(new Date(item.createdAt).getMonth() + 1).padStart(2, "0")}
                                        {item.type === "phone" && " - Qua số điện thoại"}
                                    </Text>
                                    <View>
                                        <Text style={styles.textContent}>
                                            {renderContent(item.content, item.id)}
                                        </Text>
                                        {!expanded[item.id] && item.content.length > 50 && (
                                            <TouchableOpacity onPress={() => setExpanded(prev => ({ ...prev, [item.id]: true }))}>
                                                <Text style={{ color: "gray", fontSize: 15, position: "absolute", right: 10, bottom: 10 }}>Xem thêm</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </>
                            ) : (
                                <Text style={{ color: "gray", marginTop: 5 }}>Muốn kết bạn</Text>
                            )

                            }
                            <View style={styles.boxButton}>
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.textDecline} onPress={() => handleRespondToFriendRequest(item.sender?.supabaseId, "rejected")}>Từ chối</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.textAccept} onPress={() => handleRespondToFriendRequest(item.sender?.supabaseId, "accepted")}>Đồng ý</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={{ fontSize: 16, fontWeight: 'bold', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.grayLight }}>{title}</Text>
                )}
            />
        </ScreenWrapper>
    );
};

export default FriendRequest;

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
    boxSelect: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grayLight,
        height: hp(6)
    },
    select: {
        borderBottomWidth: 1,
        borderBottomColor: "black",
    },
    textActive: {
        fontSize: 16,
        color: "black",
        fontWeight: theme.fonts.medium,
        borderBottomWidth: 1,
        borderBottomColor: "black",
        height: "100%",
        lineHeight: hp(6),
        width: wp(40),
        textAlign: "center"
    },
    textNoActive: {
        fontSize: 16,
        color: theme.colors.textLight,
        height: "100%",
        lineHeight: hp(6),
        width: wp(40),
        textAlign: "center"
    },

    // Style của mỗi lời mời kết bạn
    buttonUser: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    boxContent: {
        paddingHorizontal: 20,
        justifyContent: 'space-evenly',
    },
    avatarUser: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    textNameUser: {
        fontSize: 16,
        fontWeight: theme.fonts.medium,
        marginTop: 5,
    },
    textDateRequest: {
        color: "gray",
        fontSize: 16,
        marginTop: 5,
    },
    textContent: {
        padding: 10,
        borderWidth: 1,
        borderColor: theme.colors.textLight,
        borderRadius: 7,
        width: wp(70),
        fontSize: 15,
        marginTop: 5,
    },
    boxButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        alignItems: 'center',
        width: wp(70),
    },
    button: {
        backgroundColor: theme.colors.darkLight,
        paddingVertical: 7,
        borderRadius: 30,
        width: "45%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxContactMethod: {
        flexDirection: 'row',
        gap: 12, // Khoảng cách giữa các icon
    },
    textDecline: {
        textTransform: 'uppercase',
        color: 'black',
        fontWeight: theme.fonts.medium,
        fontSize: 14,
    },
    textAccept: {
        textTransform: 'uppercase',
        color: theme.colors.primaryLight,
        fontWeight: theme.fonts.medium,
        fontSize: 14,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: theme.fonts.medium,
        backgroundColor: '#f7f7f7',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
});
