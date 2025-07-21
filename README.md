# Expo React Server Components (RSC) Proof-of-Concept

This project is a proof-of-concept demonstrating how React Server Components can be used with Expo (React Native) without relying on `expo-router`. This is an experimental setup to understand the underlying mechanics of RSCs in a mobile environment.

## Current Status

**Phase 1: RSC Server Setup - COMPLETE**
The server is set up to render a simple `Greeting` React Server Component and serve it as an RSC stream.

- **Server Directory**: `server/`
- **Server Entry Point**: `server/src/index.js`
- **Server Component**: `server/src/Greeting.server.tsx`
- **Abstract UI Components (Server-side aliases)**:
  - `server/src/components/View.server.tsx` (renders `<div>`)
  - `server/src/components/Text.server.tsx` (renders `<p>`)
- **Server Start Command**: `cd server && npm start` (runs on `http://localhost:3000/rsc`)
- **Verification**: `curl http://localhost:3000/rsc` should return an RSC payload.

## TODOs / Next Steps

**Phase 2: React Native Client Integration**

1.  **Create a Client Component**:
    - Create a new React Native component (e.g., `RSCClient.tsx` in the root directory).
    - This component will be responsible for fetching the RSC payload from `http://localhost:3000/rsc`.
2.  **Implement RSC Stream Parsing and Rendering**:
    - This is the most complex part. We will need to use `react-server-dom-webpack/client` to parse the incoming RSC stream.
    - Crucially, we will need to provide a mapping from the generic HTML tags (`div`, `p`) in the RSC payload to actual React Native components (`<View>`, `<Text>`). This will involve creating client-side `View.client.tsx` and `Text.client.tsx` components.
3.  **Integrate `RSCClient` into `App.tsx`**:
    - Modify `App.tsx` to render the `RSCClient` component, displaying the server-rendered content.
4.  **Testing and Debugging**:
    - Run the Expo app and verify that the server-rendered content appears correctly.
    - Address any issues related to network requests, stream parsing, or component rendering.

## How to Run

1.  **Start the RSC Server**:

    ```bash
    cd server
    npm install
    npm run build
    npm start
    ```

    (The server will run on `http://localhost:3000`)

    `curl http://localhost:3000/rsc > rsc-sample.json`

2.  **Run the Expo App**:
    ```bash
    npm install # in the project root
    npm start
    ```
    (Follow Expo's instructions to open on a device or emulator)

---

_Note: This is an experimental setup. `expo-router` provides a more robust and integrated solution for React Server Components in Expo._
