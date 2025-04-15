import { Image, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { Video } from "expo-av";
import ViewShot from 'react-native-view-shot';
import { iconFile } from "./iconFile";

const AttachReplytoMessage = ({ message }) => {
    const videoRef = useRef(null);
    const viewShotRef = useRef(null);
    const [thumbnailUri, setThumbnailUri] = useState(null);

    useEffect(() => {
        if (message?.media?.fileUrl) {
            captureThumbnail();
        }
    }, [message?.media?.fileUrl]);

    const captureThumbnail = async () => {
        if (!message?.media?.fileUrl || !videoRef.current || !viewShotRef.current) {
            console.log("Thiếu fileUrl, videoRef hoặc viewShotRef");
            return;
        }

        // Load video
        await videoRef.current.loadAsync(
            { uri: message.media.fileUrl },
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
    };

    return (
        <View style={styles.container}>
            <View style={{ width: 2, height: "100%", backgroundColor: theme.colors.gray }} />
            <View style={{ paddingHorizontal: 5 }}>
                {/* Content */}
                {message?.content && (
                    <View style={{ paddingHorizontal: 5 }}>
                        <Text style={{ fontWeight: "bold" }}>{message?.senderId?.name}</Text>
                        <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">{message?.content}</Text>
                    </View>
                )}
                {/* Media */}
                {message?.media && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {thumbnailUri && (
                            <Image
                                source={{ uri: thumbnailUri }}
                                style={{ width: 50, height: 50, borderColor: theme.colors.gray, borderWidth: 1 }}
                                resizeMode="contain"
                            />
                        )}
                        <View style={{ paddingHorizontal: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{message?.senderId?.name}</Text>
                            <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">
                                [Media] {message?.content || message?.media?.fileName}
                            </Text>
                        </View>
                    </View>
                )}
                {/* Files */}
                {message?.files && (
                    message?.files?.fileType === "audio/m4a" ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Icon name="microOn" size={24} color="gray" />
                            <View style={{ paddingHorizontal: 5 }}>
                                <Text style={{ fontWeight: "bold" }}>{message?.senderId?.name}</Text>
                                <Text style={{ color: "gray" }} numberOfLines={1} ellipsizeMode="tail">
                                    [Tin nhắn thoại]
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {iconFile(message?.files?.fileType)}
                            <View style={{ paddingHorizontal: 5, position: "relative" }}>
                                <Text>{message?.senderId?.name}</Text>
                                <Text style={{ color: "gray", width: "90%" }} numberOfLines={1} ellipsizeMode="tail">
                                    {message?.files?.fileName}
                                </Text>
                            </View>
                        </View>
                    )
                )}
            </View>
            {/* Video ẩn để chụp thumbnail */}
            {
                message?.media?.fileUrl && (
                    <ViewShot ref={viewShotRef} style={{ position: 'absolute', opacity: 0, width: 100, height: 100 }}>
                        <Video
                            ref={videoRef}
                            style={{ width: 100, height: 100 }}
                            source={{ uri: message?.media?.fileUrl }}
                            resizeMode="contain"
                        />
                    </ViewShot>
                )
            }
        </View >
    );
};

export default AttachReplytoMessage;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
    },
});
