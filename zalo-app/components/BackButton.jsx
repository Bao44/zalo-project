import { Pressable, StyleSheet } from "react-native";
import React from "react";
import Icon from "../assets/icons";
import { theme } from "../constants/theme";

const BackButton = ({ size = 30, router }) => {
  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <Icon
        name="arrowLeft"
        strokeWidth={2.5}
        size={size}
        color={theme.colors.text}
      />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
  },
});
