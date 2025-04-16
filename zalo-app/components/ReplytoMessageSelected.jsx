import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { Video } from "expo-av";
import ViewShot from 'react-native-view-shot';
import { iconFile } from "./iconFile";

const ReplytoMessageSelected = ({ messageReplyto, setMessageReplyto }) => {
    const videoRef = useRef(null);
    const viewShotRef = useRef(null);
    const [thumbnailUri, setThumbnailUri] = useState(null);

    useEffect(() => {
        if (messageReplyto?.media?.fileUrl) {
            captureThumbnail();
        }
    }, [messageReplyto?.media?.fileUrl]);

    const captureThumbnail = async () => {
        if (!messageReplyto?.media?.fileUrl || !videoRef.current || !viewShotRef.current) {
            console.log("Thiếu fileUrl, videoRef hoặc viewShotRef");
            return;
        }

        try {
            // Load video
            await videoRef.current.loadAsync(
                { uri: messageReplyto.media.fileUrl },
                { shouldPlay: false }
            );

            // Lấy thời lượng video
            const status = await videoRef.current.getStatusAsync();
            if (!status.isLoaded || !status.durationMillis) {
                console.log("Video không load được hoặc không có thời lượng");
                return;
            }

            // Đặt vị trí chụp thumbnail (0% thời lượng)
            const snapshotTime = status.durationMillis * 10;
            await videoRef.current.setPositionAsync(snapshotTime);

            // Đợi một chút để đảm bảo video render frame
            await new Promise(resolve => setTimeout(resolve, 200));

            // Chụp ảnh
            const uri = await viewShotRef.current.capture();
            setThumbnailUri(uri);

            // Unload video
            await videoRef.current.unloadAsync();
        } catch (error) {
            console.error('Lỗi khi chụp thumbnail:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ width: 2, height: "100%", backgroundColor: theme.colors.gray }} />
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                {/* Content */}
                {messageReplyto?.content && (
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text>{messageReplyto?.senderId?.name}</Text>
                        <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">{messageReplyto?.content}</Text>
                    </View>
                )}
                {/* Media */}
                {messageReplyto?.media && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {thumbnailUri && (
                            <Image
                                source={{ uri: thumbnailUri }}
                                style={{ width: 50, height: 50, borderColor: theme.colors.gray, borderWidth: 1 }}
                                resizeMode="contain"
                            />
                        )}
                        <View style={{ paddingHorizontal: 10 }}>
                            <Text>{messageReplyto?.senderId?.name}</Text>
                            <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">
                                {messageReplyto?.content || messageReplyto?.media?.fileName}
                            </Text>
                        </View>
                    </View>
                )}
                {/* Files */}
                {messageReplyto?.files && (
                    messageReplyto?.files?.fileType === "audio/m4a" ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Icon name="microOn" size={24} color="gray" />
                            <View style={{ paddingHorizontal: 10 }}>
                                <Text>{messageReplyto?.senderId?.name}</Text>
                                <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">
                                    [Tin nhắn thoại]
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {iconFile(messageReplyto?.files?.fileType)}
                            <View style={{ paddingHorizontal: 10 }}>
                                <Text>{messageReplyto?.senderId?.name}</Text>
                                <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">
                                    {messageReplyto?.files?.fileName}
                                </Text>
                            </View>
                        </View>
                    )
                )}
            </View>
            <TouchableOpacity onPress={() => setMessageReplyto(null)}>
                <Icon name="cancel" size={24} color={theme.colors.gray} />
            </TouchableOpacity>
            {/* Video ẩn để chụp thumbnail */}
            {
                messageReplyto?.media?.fileUrl && (
                    <ViewShot ref={viewShotRef} style={{ position: 'absolute', opacity: 0, width: 100, height: 100 }}>
                        <Video
                            ref={videoRef}
                            style={{ width: 100, height: 100 }}
                            source={{ uri: messageReplyto?.media?.fileUrl }}
                            resizeMode="contain"
                        />
                    </ViewShot>
                )
            }
        </View >
    );
};

export default ReplytoMessageSelected;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray,
        width: "100%",
        backgroundColor: "#FFF",
    },
});