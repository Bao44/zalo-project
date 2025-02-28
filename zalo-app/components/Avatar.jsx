import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import { Image } from "expo-image";


const Avatar = ({
  uri,
  size = hp(5.5),
  rounded = theme.radius.xxl,
  style = {},
}) => {
  return (
    <Image
      source={require('../assets/images/defaultUser.png')}
      transition={100}
      style={[
        styles.avatar,
        { height: size, width: size, borderRadius: rounded },
        style,
      ]}
    />
  );
};

export default Avatar;

const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: theme.colors.darkLight,
    },
});