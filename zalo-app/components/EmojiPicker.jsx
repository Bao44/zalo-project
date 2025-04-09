import emojiData from 'emoji-datasource/emoji.json';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

const categories = ['Smileys & Emotion', 'Animals & Nature', 'Food & Drink'];

export default function EmojiPicker({ onSelect }) {
    const [selectedCategory, setSelectedCategory] = useState('Smileys & Emotion');

    const emojis = emojiData
        .filter(e => e.category === selectedCategory)
        .map(e => ({
            ...e,
            emoji: e.unified.split('-').map(u => String.fromCodePoint(parseInt(u, 16))).join(''),
        }));

    return (
        <View style={{ height: "100%", backgroundColor: '#fff' }}>
            {/* Tabs */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}>
                        <Text style={{ padding: 10 }}>{cat.split(' ')[0]}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Emoji Grid */}
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {emojis.map(e => (
                    <TouchableOpacity key={e.unified} onPress={() => onSelect(e.emoji)}>
                        <Text style={{ fontSize: 28, margin: 5 }}>{e.emoji}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
