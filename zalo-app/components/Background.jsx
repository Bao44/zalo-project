import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import { Image } from "expo-image";
import { getUserBackgroundImageSrc } from "../api/image";

const Background = ({ uri, sizeWidth, sizeHeight, style = {}, children }) => {
  return (
    <Image
      source={getUserBackgroundImageSrc(uri)}
      transition={100}
      style={[
        styles.background,
        { height: sizeHeight, width: sizeWidth },
        style,
      ]}
    />
  );
};

export default Background;

const styles = StyleSheet.create({
  background: {},
});
