import React from "react";
import View from "./components/View.server";
import Text from "./components/Text.server";

export default function Greeting() {
  return (
    <View>
      <Text>Hello from the server!</Text>
      <Text>This is a React Server Component.</Text>
    </View>
  );
}
