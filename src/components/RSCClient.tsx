import React, { useState, useEffect, use } from "react";
import { createFromFetch } from "react-server-dom-webpack/client";
import { fetch } from "expo/fetch";
import { View, Text } from "react-native";

const RSCContent = ({ children }: { children: Promise<any> }) => use(children);

const RSCClient = () => {
  const rsc = createFromFetch(fetch("http://localhost:3000/rsc"));

  rsc.finally(() => console.log("promise done!"));

  return (
    <View>
      <Text>RSC Content:</Text>
      <React.Suspense fallback={<Text>Loading...</Text>}>
        <RSCContent>{rsc}</RSCContent>
      </React.Suspense>
    </View>
  );
};

export default RSCClient;
