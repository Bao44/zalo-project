import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { wp } from "../../helpers/common";
import Header from "../../components/Header";
import { theme } from "../../constants/theme";

const Notifications = () => {
  return (
    <ScreenWrapper>
      <View style={styles.viewHeader}>
        <Header title="Thông báo mới" textColor="white" />
      </View>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ gap: 20 }}></ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  viewHeader: {
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
});
