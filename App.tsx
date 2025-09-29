import "@expo/metro-runtime/rsc/runtime";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import RSCClient from "./src/components/RSCClient";

import "./src/components/Text.client";
import "./src/components/View.client";

export default function App() {
  return (
    <View style={styles.container}>
      <RSCClient />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
