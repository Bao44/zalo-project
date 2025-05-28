import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { theme } from "../constants/theme";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import FileViewer from "react-native-file-viewer"; // Import FileViewer
import { iconFile } from "@/components/iconFile";

const ViewFile = ({ file }) => {
    // Optional: Keep the download/share function
    const handleDownload = async () => {
        // try {
        //     if (!file?.fileUrl) {
        //         Alert.alert("Lỗi", "Không tìm thấy URL của file.");
        //         return;
        //     }

        //     const downloadPath = `${FileSystem.documentDirectory}${file.fileName}`;
        //     const { uri } = await FileSystem.downloadAsync(file.fileUrl, downloadPath);

        //     const fileInfo = await FileSystem.getInfoAsync(uri);
        //     if (!fileInfo.exists) {
        //         Alert.alert("Lỗi", "File không được tải thành công.");
        //         return;
        //     }

        //     const canShare = await Sharing.isAvailableAsync();
        //     if (canShare) {
        //         await Sharing.shareAsync(uri);
        //         Alert.alert("Thành công", "File đã được tải, bạn có thể mở hoặc lưu từ đây!");
        //     } else {
        //         Alert.alert("Lỗi", "Không thể chia sẻ file trên thiết bị này.");
        //     }
        // } catch (error) {
        //     console.error("Error downloading file:", error);
        //     Alert.alert("Lỗi", `Không thể tải file: ${error.message}`);
        // }
    };

    return (
        <TouchableOpacity onPress={() => Linking.openURL(file.fileUrl)} style={styles.container}>
            {iconFile(file.fileType)}
            <Text style={styles.text}>{file.fileName}</Text>
            <View style={styles.buttonContainer}>
                {/* Button to download/share file */}
                <TouchableOpacity onPress={handleDownload} style={styles.button}>
                    <Icon name="download" size={20} color="gray" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default ViewFile;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        width: "auto",
    },
    text: {
        fontSize: 14,
        color: "black",
        fontWeight: theme.fonts.medium,
        paddingHorizontal: 10,
        numberOfLines: 2,
        ellipsizeMode: "tail",
        width: "60%", // Adjusted to make space for two buttons
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 10, // Space between buttons
    },
    button: {
        padding: 5,
    },
});