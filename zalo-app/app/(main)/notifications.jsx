import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { wp } from "../../helpers/common";
import Header from "../../components/Header";

const Notifications = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Thông báo mới" />
        <ScrollView contentContainerStyle={{ gap: 20 }}></ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
});
