import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome"; // Dùng FontAwesome từ react-native-vector-icons
import { theme } from "../constants/theme";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { iconFile } from "@/components/iconFile";

const ViewFile = ({ file }) => {

    const handleDownload = async () => {
        try {
            if (!file?.fileUrl) {
                Alert.alert("Lỗi", "Không tìm thấy URL của file.");
                return;
            }

            const downloadPath = `${FileSystem.documentDirectory}${file.fileName}`;
            const { uri } = await FileSystem.downloadAsync(file.fileUrl, downloadPath);

            // Kiểm tra xem file có tồn tại không
            const fileInfo = await FileSystem.getInfoAsync(downloadPath);
            if (!fileInfo.exists) {
                Alert.alert("Lỗi", "File không được tải thành công.");
                return;
            }

            // Mở file hoặc chia sẻ
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(downloadPath);
                Alert.alert("Thành công", "File đã được tải, bạn có thể mở hoặc lưu từ đây!");
            } else {
                Alert.alert("Lỗi", "Không thể chia sẻ file trên thiết bị này.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể tải file: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            {iconFile(file.fileType)}
            <Text style={styles.text}>{file.fileName}</Text>
            <TouchableOpacity onPress={handleDownload}>
                <Icon name="download" size={20} color="gray" />
            </TouchableOpacity>
        </View>
    );
};

export default ViewFile;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        width: 'auto'
    },
    text: {
        fontSize: 14,
        color: "black",
        fontWeight: theme.fonts.medium,
        paddingHorizontal: 10,
        numberOfLines: 2,
        ellipsizeMode: 'tail',
        width: '70%',
    },
});
