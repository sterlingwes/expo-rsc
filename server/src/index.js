import express from 'express';
import React from 'react';
import { renderToPipeableStream } from 'react-server-dom-webpack/server';
import Greeting from './Greeting.server.js';

const app = express();

app.get('/rsc', (_req, res) => {
  const { pipe } = renderToPipeableStream(React.createElement(Greeting));
  pipe(res);
});

app.listen(3000, () => {
  console.log('RSC server listening on port 3000');
});
