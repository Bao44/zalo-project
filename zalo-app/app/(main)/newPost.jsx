import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";

const NewPost = () => {
  return (
    <ScreenWrapper>
      <View style={styles.viewHeader}>
        <Header title="Bài viết mới" textColor="white"/>
      </View>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <Text style={styles.title}>Chia sẻ với mọi người</Text>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  viewHeader: {
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
