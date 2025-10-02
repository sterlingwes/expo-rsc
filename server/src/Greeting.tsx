import React from "react";
import { View, Text } from "react-native";
// import View from "../../src/components/View.client";
// import Text from "../../src/components/Text.client";

export default function Greeting() {
  return (
    <View>
      <Text>Hello from the server!</Text>
      <Text>This is a React Server Component.</Text>
    </View>
  );
}
