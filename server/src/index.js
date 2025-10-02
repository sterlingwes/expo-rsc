import express from "express";
import helmet from "helmet";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import Loading from "./Loading.js";
import Greeting from "./Greeting.js";

import moduleMapJson from "../../module-map.json";

const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    strictTransportSecurity: false,
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  })
);

app.get("/rsc", (req, res) => {
  res.setHeader("Content-Type", "text/x-component");
  res.setHeader("Transfer-Encoding", "chunked");

  const reactElement = React.createElement(
    Suspense,
    { fallback: React.createElement(Loading, null, "Loading...") },
    React.createElement(Greeting)
  );

  let didError = false;

  const { pipe, abort } = renderToPipeableStream(reactElement, moduleMapJson, {
    onError(error) {
      console.error("Streaming error:", error);
      didError = true;
    },
  });

  pipe(res);

  const timeout = setTimeout(() => {
    console.log("Request timeout, aborting render");
    abort();
  }, 10000); // 10 second timeout

  res.on("finish", () => {
    clearTimeout(timeout);
  });

  res.on("close", () => {
    clearTimeout(timeout);
  });
});

app.listen(3000, () => {
  console.log("RSC server listening on port 3000");
});
