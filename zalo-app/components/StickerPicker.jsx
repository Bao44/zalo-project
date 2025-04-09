import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { stickerPacks } from '../assets/dataLocals/stickerPacks';

export default function StickerPicker({ onSelect }) {
  const [activePack, setActivePack] = useState(stickerPacks[0]);

  return (
    <View style={{ backgroundColor: '#fff', paddingTop: 8 }}>
      {/* Tabs: icon của từng pack */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10 }}>
        {stickerPacks.map(pack => (
          <TouchableOpacity
            key={pack.name}
            onPress={() => setActivePack(pack)}
            style={{
              marginRight: 10,
              padding: 4,
              borderRadius: 8,
              borderWidth: activePack.name === pack.name ? 2 : 0,
              borderColor: '#007AFF',
              backgroundColor: '#f0f0f0'
            }}
          >
            <Image source={{ uri: pack.icon }} style={{ width: 36, height: 36 }} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticker grid */}
      <ScrollView contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10
      }}>
        {activePack.stickers.map((stickerUrl, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(stickerUrl)}
            style={{ padding: 6 }}
          >
            <Image
              source={{ uri: stickerUrl }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
