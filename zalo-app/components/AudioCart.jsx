import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { wp, hp } from "@/helpers/common";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessage, createConversation1vs1 } from "@/api/messageAPI";

const AudioCart = ({ conversation, parsedData, setMessages, setStempId, setConversation, setShowGallery }) => {
    const { user } = useAuth();
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUri, setAudioUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef(null);
    const [stoped, setStopped] = useState(false);

    // Yêu cầu quyền truy cập microphone
    const requestAudioPermission = async () => {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Quyền truy cập microphone", "Vui lòng cấp quyền truy cập microphone để ghi âm.");
            return false;
        }
        return true;
    };

    // Bắt đầu ghi âm
    // Bắt đầu ghi âm
    const startRecording = async () => {
        try {
            const hasPermission = await requestAudioPermission();
            if (!hasPermission) return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Dọn dẹp timer cũ nếu tồn tại
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Dọn dẹp recording cũ nếu tồn tại
            if (recording) {
                try {
                    await recording.stopAndUnloadAsync();
                } catch (err) {
                    console.warn("Không thể stop recording cũ:", err);
                }
                setRecording(null);
            }

            // Reset trạng thái
            setRecordingTime(0);
            setAudioUri(null);
            setStopped(false);

            // Bắt đầu ghi âm mới
            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await newRecording.startAsync();

            setRecording(newRecording);
            setIsRecording(true);

            // Bắt đầu đếm thời gian
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            console.log("Đang ghi âm...");
        } catch (error) {
            console.error("Lỗi khi bắt đầu ghi âm:", error);
            Alert.alert("Lỗi", "Không thể bắt đầu ghi âm: " + error.message);
            setRecording(null);
            setIsRecording(false);
        }
    };

    // Dừng ghi âm
    const stopRecording = async () => {
        try {
            if (!recording) return;

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            setAudioUri(uri);
            setRecording(null);
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setStopped(true);
        } catch (error) {
            console.error("Lỗi khi dừng ghi âm:", error);
            Alert.alert("Lỗi", "Không thể dừng ghi âm.");
            setRecording(null);
            setIsRecording(false);
        }
    };

    // Phát lại âm thanh đã ghi
    const playAudio = async () => {
        try {
            if (!audioUri) return;
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }
            const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
            setSound(newSound);

            newSound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish || status.isLoaded === false) {
                    await newSound.unloadAsync();
                    setSound(null);
                }
            });

            await newSound.playAsync();
        } catch (error) {
            console.error("Lỗi khi phát lại âm thanh:", error);
            Alert.alert("Lỗi", "Không thể phát lại âm thanh.");
        }
    };

    // Xóa âm thanh
    const deleteAudio = async () => {
        try {
            // Dừng và xóa timer nếu tồn tại
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Xóa file âm thanh
            if (audioUri) {
                await FileSystem.deleteAsync(audioUri, { idempotent: true });
                setAudioUri(null);
            }

            // Dừng và xóa sound nếu tồn tại
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            // Dừng và xóa recording nếu tồn tại
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
                setIsRecording(false);
            }

            // Reset trạng thái
            setRecordingTime(0);
            setStopped(false);
        } catch (error) {
            console.error("Lỗi khi xóa âm thanh:", error);
            Alert.alert("Lỗi", "Không thể xóa âm thanh.");
        }
    };

    // Gửi âm thanh
    const sendAudio = async () => {
        try {
            if (!audioUri) {
                Alert.alert("Lỗi", "Chưa có file âm thanh để gửi.");
                return;
            }

            let conversationId = conversation?._id;

            if (!conversation) {
                if (!user?.id || !parsedData?._id) {
                    Alert.alert("Lỗi", "Thông tin người dùng hoặc người nhận không hợp lệ");
                    return;
                }
                const response = await createConversation1vs1(user?.id, parsedData?._id);
                if (response.success && response.data) {
                    setConversation(response.data);
                    conversationId = response.data._id;
                } else {
                    const errorMsg = response.data?.message || "Không rõ nguyên nhân";
                    Alert.alert("Lỗi", `Không thể tạo cuộc trò chuyện: ${errorMsg}`);
                    return;
                }
            }

            if (!conversationId) {
                Alert.alert("Lỗi", "Không thể xác định ID cuộc trò chuyện");
                return;
            }

            const fileBase64 = await FileSystem.readAsStringAsync(audioUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const t = Date.now().toString();
            setStempId(t);

            const audioData = {
                uri: fileBase64,
                name: `audio_${t}.m4a`,
                type: "audio/m4a",
            };

            const messageData = {
                idTemp: t,
                senderId: user?.id,
                content: "",
                attachments: null,
                media: null,
                file: audioData,
                receiverId: parsedData?._id,
            };

            setMessages((prev) => [
                {
                    _id: t,
                    senderId: { _id: user?.id, name: user?.name, avatar: user?.avatar },
                    content: "",
                    attachments: [],
                    media: null,
                    files: audioData,
                    createdAt: new Date().toISOString(),
                    removed: [],
                },
                ...prev,
            ]);

            const response = await sendMessage(conversationId, messageData);
            if (response.success && response.data) {
                setMessages((prev) => {
                    const index = prev.findIndex((msg) => msg._id === t);
                    if (index !== -1) {
                        const updatedMessages = [...prev];
                        updatedMessages[index] = {
                            ...updatedMessages[index],
                            _id: response.data._id,
                            ...response.data,
                            removed: Array.isArray(response.data.removed) ? response.data.removed : [],
                        };
                        return updatedMessages;
                    }
                    return prev;
                });
            } else {
                Alert.alert("Lỗi", `Không thể gửi âm thanh: ${response.data?.message || "Lỗi không xác định"}`);
            }

            await deleteAudio();
            setShowGallery(false);
        } catch (error) {
            console.error("Lỗi khi gửi âm thanh:", error);
            Alert.alert("Lỗi", "Không thể gửi âm thanh: " + (error.message || "Lỗi không xác định"));
        }
    };

    // Dọn dẹp khi component unmount
    useEffect(() => {
        return () => {
            const cleanup = async () => {
                try {
                    if (recording) {
                        await recording.stopAndUnloadAsync();
                        setRecording(null);
                    }
                    if (sound) {
                        await sound.unloadAsync();
                        setSound(null);
                    }
                } catch (error) {
                    console.error("Lỗi khi dọn dẹp tài nguyên:", error);
                }
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
            cleanup();
        };
    }, []);

    // Format thời gian
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <View style={styles.container}>
            {isRecording || audioUri ? (
                <>
                    <Text style={styles.recordingText}>
                        {isRecording ? "Đang ghi âm..." : "Âm thanh đã ghi"}: {formatTime(recordingTime)}
                    </Text>
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.option} onPress={deleteAudio}>
                            <View style={[styles.button, { backgroundColor: theme.colors.gray }]}>
                                <Icon name="delete" size={30} color="#000" />
                            </View>
                            <Text style={styles.optionText}>Xóa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={sendAudio} disabled={!audioUri}>
                            <View
                                style={[
                                    styles.button,
                                    { backgroundColor: audioUri ? theme.colors.primary : theme.colors.gray },
                                ]}
                            >
                                <Icon name="sent" size={30} color="#FFF" fill="#FFF" />
                            </View>
                            <Text style={styles.optionText}>Gửi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={stoped ? playAudio : stopRecording}>
                            <View style={[styles.button, { backgroundColor: theme.colors.gray }]}>
                                <Icon name={stoped ? "play" : "pause"} size={30} color="#000" />
                            </View>
                            <Text style={styles.optionText}>{stoped ? "Phát lại" : "Dừng"}</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.promptText}>Bấm để ghi âm</Text>
                    <TouchableOpacity style={styles.button} onPress={startRecording}>
                        <Icon name="microOn" size={30} color="#FFF" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default AudioCart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-evenly",
        alignItems: "center",
        width: "100%",
        paddingVertical: hp(2),
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        width: "100%",
        height: "50%",
    },
    option: {
        justifyContent: "center",
        alignItems: "center",
        width: "30%",
        height: "100%",
        borderRadius: 10,
    },
    optionText: {
        fontSize: 16,
        marginTop: hp(1),
        color: theme.colors.text,
    },
    button: {
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        width: wp(15),
        height: wp(15),
    },
    stopButton: {
        backgroundColor: theme.colors.red,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        width: wp(15),
        height: wp(15),
        flexDirection: "row",
    },
    stopText: {
        color: "#FFF",
        fontSize: 16,
        marginLeft: wp(1),
    },
    recordingText: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.text,
    },
    promptText: {
        fontSize: 18,
        color: theme.colors.text,
    },
});