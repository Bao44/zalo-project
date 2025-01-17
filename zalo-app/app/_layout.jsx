import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    ></Stack>
  );
};

export default _layout;
