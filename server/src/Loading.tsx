import React from "react";
import { View, Text } from "react-native";
// import View from "../../src/components/View.client";
// import Text from "../../src/components/Text.client";

export default function Loading({ children }) {
  return (
    <View>
      <Text>{children}</Text>
    </View>
  );
}
