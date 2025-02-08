import { StyleSheet, TextInput, View, TouchableOpacity, ScrollView, FlatList, Image, Text } from "react-native";
import React, { useState, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import OfficialAccount from "../../assets/dataLocals/OfficialAccount";
import { hp, wp } from "../../helpers/common";
import { router } from "expo-router";

const SearchOA = () => {

    const [search, setSearch] = useState("");

    //Xử lý logic nút quan tâm
    const handleFollow = (status) => {
        if(status === 'uninterested'){
            //Xử lý logic quan tâm thay đổi trạng thái
        }else{
            //Xử lý logic xem
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={() => router.back()}>
                    <Icon
                        name="arrowLeft"
                        size={28}
                        strokeWidth={1.6}
                        color={theme.colors.darkLight}
                    />
                </TouchableOpacity>
                <View style={styles.boxTextInput}>
                    <TextInput
                        style={styles.textInput}
                        placeholderTextColor={"white"}
                        placeholder="Tìm Official Account"
                    ></TextInput>
                </View>
            </View>
            <ScrollView>
                <FlatList
                    data={OfficialAccount}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.buttonOA}>
                            <Image style={styles.avatarOA} source={{ uri: item.avatar }} />
                            <View style={styles.boxInfoOA}>
                                <Text style={styles.textNameOA} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                                <Text style={styles.textDescriptionOA} numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
                            </View>
                            <TouchableOpacity style={styles.button} onPress={() => handleFollow(item.status)}>
                                <Text style={styles.textButton}>{item.status === "uninterested" ? "Quan tâm" : "Xem"}</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
        </ScreenWrapper>
    );
};

export default SearchOA;

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primaryLight,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
    },
    boxTextInput: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.darkLight,
        width: "80%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    textInput: {
        fontSize: 17,
        width: "100%",
        color: "#FFF",
        height: "100%",
    },
    buttonOA: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: hp(9),
    },
    avatarOA: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    textNameOA: {
        fontSize: 17,
        width: "100%",
    },
    boxInfoOA: {
        width: "50%",
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
    },
    textDescriptionOA: {
        fontSize: 14,
        color: "gray",
        width: "100%",
    },
    button:{
        backgroundColor: theme.colors.grayLight,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(22),
        height: hp(4),
    },
    textButton: {
        color: theme.colors.primaryLight,
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: theme.fonts.medium
    }
});
