import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { hp, wp } from "@/helpers/common";

const InfoChat1vs1 = () => {
    return (
        <ScreenWrapper>
            <ScrollView>
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
                <View style={styles.container1}>
                    <Avatar size={90} rounded={45} />
                    <Text style={styles.textName}>Name</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-evenly', height: "30%", width: "100%" }}>
                        <View style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="search"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Tìm tin nhắn</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="profile"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Trang cá nhân</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="zTyle"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Đổi hình nền</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "space-between", height: "100%", width: wp(15) }}>
                            <View style={{ backgroundColor: theme.colors.gray, width: wp(10), height: wp(10), borderRadius: wp(5), alignItems: "center", justifyContent: "center" }}>
                                <Icon
                                    name="notification"
                                    size={24}
                                    strokeWidth={1.6}
                                    color="black"
                                />
                            </View>
                            <Text style={{ textAlign: "center" }}>Tắt thông báo</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.container2}>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="edit"
                            size={24}
                            strokeWidth={1.6}
                            color="black"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Đổi tên gọi nhớ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="star"
                            size={24}
                            strokeWidth={1.6}
                            color="black"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Đánh dấu bạn thân</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.box}>
                        <Icon
                            name="information"
                            size={24}
                            strokeWidth={1.6}
                            color="black"
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
                            color="black"
                        />
                        <Text style={{ marginLeft: 20, fontSize: 17 }}>Nhật ký chung</Text>
                    </View>
                    <View style={styles.box}>

                    </View>
                </TouchableOpacity>
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
});
