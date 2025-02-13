import { View, TouchableOpacity } from "react-native";
import React from "react";
import Icon from "../assets/icons";

const RadioButton = ({ isSelect, size, color, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View
                style={[{
                    height: size,
                    width: size,
                    borderRadius: size / 2,
                    borderWidth: 2,
                    borderColor: color,
                    alignItems: "center",
                    justifyContent: "center",
                }, isSelect && { backgroundColor: color }]}
            >
                {isSelect && (
                    <Icon name="tick" size={size * 0.8} strokeWidth={2} color="#FFF" />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default RadioButton;
