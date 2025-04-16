import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import Icon from '@/assets/icons';
import { theme } from '@/constants/theme';

export default function AudioPlayer({ uri }) {
    const soundRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const numBars = 20;
    const [barHeights] = useState(
        Array.from({ length: numBars }, () => Math.floor(Math.random() * (30 - 10 + 1)) + 10)
    ); // Độ cao ngẫu nhiên từ 10 đến 30

    useEffect(() => {
        loadSound();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false, isLooping: false },
            onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setIsLoaded(true);
    };

    const onPlaybackStatusUpdate = async (status) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                if (soundRef.current) {
                    await soundRef.current.stopAsync();
                    await soundRef.current.setPositionAsync(0);
                }
            }
        }
    };

    const handlePlay = async () => {
        if (soundRef.current) {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        }
    };

    const handlePause = async () => {
        if (soundRef.current) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        }
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Tính phần trăm tiến độ
    const progress = duration > 0 ? position / duration : 0;
    const filledBars = Math.floor(progress * numBars); // Số thanh được tô màu

    return (
        <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', height: 50, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={isPlaying ? handlePause : handlePlay}
                    disabled={!isLoaded}
                    style={{
                        backgroundColor: theme.colors.primary,
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#FFF" fill="#FFF" />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}>
                {barHeights.map((height, index) => (
                    <View
                        key={index}
                        style={{
                            width: 4,
                            height: height, // Độ cao ngẫu nhiên từ mảng barHeights
                            backgroundColor: index < filledBars ? theme.colors.primary : '#E0E0E0',
                            marginHorizontal: 1,
                            borderRadius: 2,
                        }}
                    />
                ))}
            </View>
            <View>
                <Text>{formatTime(position)} / {formatTime(duration)}</Text>
            </View>
        </View>
    );
}