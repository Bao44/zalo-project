import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome"; // Dùng FontAwesome từ react-native-vector-icons
import { theme } from "../constants/theme";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const ViewFile = ({ file }) => {
    const icon = (type) => {
        switch (type) {
            case 'application/pdf':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/2133056_document_eps_file_format_pdf_icon.png')} />;
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/6296673_microsoft_office_office365_word_icon.png')} />;
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/6296676_excel_microsoft_office_office365_icon.png')} />;
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/6296672_microsoft_office_office365_powerpoint_icon.png')} />;
            case 'application/zip':
            case 'application/x-rar-compressed':
            case 'application/vnd.rar':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/285629_zip_file_icon.png')} />;
            case 'application/json':
            case 'text/xml':
            case 'application/xml':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/211656_text_document_icon.png')} />;
            case 'text/plain':
            case 'text/html':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/9040382_filetype_html_icon.png')} />;
            case 'text/comma-separated-values':
            case 'text/csv':
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/7267724_ext_csv_file_document_format_icon.png')} />;
            default:
                return <Image style={styles.icon} source={require('../assets/images/iconFiles/211656_text_document_icon.png')} />;
        }
    };

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
            {icon(file.fileType)}
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
    icon: {
        width: 30,
        height: 30,
    },
});
