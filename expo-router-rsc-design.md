Looking at your question about how expo-router implements React Server Components without using the common "react-server-dom-webpack" libraries, I need to clarify something important: **expo-router actually does use `react-server-dom-webpack`** as a core dependency for its RSC implementation. <cite/>

## Expo-router's RSC Implementation Uses react-server-dom-webpack

Expo-router explicitly lists `react-server-dom-webpack` as a peer dependency in its package.json: [1](#0-0)

The RSC implementation directly imports and uses the core functions from this library:

1. **Client-side RSC handling** uses `react-server-dom-webpack/client` for creating RSC payloads from server responses: [2](#0-1)

2. **Server-side RSC rendering** uses `react-server-dom-webpack/server` for rendering components to RSC streams: [3](#0-2)

## How Expo-router Adapts react-server-dom-webpack for Universal Platforms

The key innovation isn't avoiding `react-server-dom-webpack`, but rather **adapting it to work across all platforms** (iOS, Android, web) through Metro bundler integration. Here's how:

### Custom Module Resolution for RSC

Expo-router implements custom resolver logic that handles React Server Components context in Metro's multi-platform resolver: [4](#0-3)

This resolver enables `react-server` import conditions and adjusts module resolution based on whether code is running in a server or client environment.

### Metro-based RSC Middleware

Instead of using webpack's module system, expo-router creates RSC middleware that integrates with Metro's bundling system: [5](#0-4)

This middleware handles RSC requests by using Metro's module loading capabilities rather than webpack's chunk loading system.

### Universal RSC Rendering

The RSC renderer adapts `react-server-dom-webpack`'s rendering functions to work with Metro's module system by implementing custom bundler and server configs: [6](#0-5)

These proxy objects intercept module resolution requests and route them through Metro's module system instead of webpack's.

## Notes

The misconception in your question likely stems from the fact that most web-based RSC implementations use webpack directly, while expo-router uses Metro as the bundler but still relies on `react-server-dom-webpack` for the core RSC protocol implementation. The "webpack" in the package name refers to the module format and loading protocol, not necessarily requiring webpack as the bundler - Metro can implement the same module loading interface that the library expects.

Wiki pages you might want to explore:

- [Development Workflow (expo/expo)](/wiki/expo/expo#4)

### Citations

**File:** packages/expo-router/package.json (L93-93)

```json
    "react-server-dom-webpack": ">= 19.0.0"
```

**File:** packages/expo-router/src/rsc/router/host.tsx (L26-26)

```typescript
import RSDWClient from "react-server-dom-webpack/client";
```

**File:** packages/expo-router/src/rsc/rsc-renderer.ts (L17-17)

```typescript
import {
  renderToReadableStream,
  decodeReply,
} from "react-server-dom-webpack/server";
```

**File:** packages/expo-router/src/rsc/rsc-renderer.ts (L100-116)

```typescript
const bundlerConfig: Record<
  string,
  ReturnType<typeof resolveRequest>
> = new Proxy(
  {},
  {
    get(_target, encodedId: string) {
      return resolveRequest(false, encodedId);
    },
  }
);

const serverConfig: Record<
  string,
  ReturnType<typeof resolveRequest>
> = new Proxy(
  {},
  {
    get(_target, encodedId: string) {
      return resolveRequest(true, encodedId);
    },
  }
);
```

**File:** packages/@expo/cli/src/start/server/metro/withMetroMultiPlatform.ts (L780-810)

```typescript
const isReactServerComponents =
  context.customResolverOptions?.environment === "react-server";

if (isReactServerComponents) {
  // NOTE: Align the behavior across server and client. This is a breaking change so we'll just roll it out with React Server Components.
  // This ensures that react-server and client code both resolve `module` and `main` in the same order.
  if (platform === "web") {
    // Node.js runtimes should only be importing main at the moment.
    // This is a temporary fix until we can support the package.json exports.
    context.mainFields = ["module", "main"];
  } else {
    // In Node.js + native, use the standard main fields.
    context.mainFields = ["react-native", "module", "main"];
  }
} else {
  if (platform === "web") {
    // Node.js runtimes should only be importing main at the moment.
    // This is a temporary fix until we can support the package.json exports.
    context.mainFields = ["main", "module"];
  } else {
    // In Node.js + native, use the standard main fields.
    context.mainFields = ["react-native", "main", "module"];
  }
}

// Enable react-server import conditions.
if (context.customResolverOptions?.environment === "react-server") {
  context.unstable_conditionNames = ["node", "react-server", "workerd"];
} else {
  context.unstable_conditionNames = ["node"];
}
```

**File:** packages/@expo/cli/src/start/server/metro/createServerComponentsMiddleware.ts (L72-132)

```typescript
const rscMiddleware = getRscMiddleware({
  config: {},
  // Disabled in development
  baseUrl: "",
  rscPath,
  onError: console.error,
  renderRsc: async (args) => {
    // In development we should add simulated versions of common production headers.
    if (args.headers["x-real-ip"] == null) {
      args.headers["x-real-ip"] = getIpAddress();
    }
    if (args.headers["x-forwarded-for"] == null) {
      args.headers["x-forwarded-for"] = args.headers["x-real-ip"];
    }
    if (args.headers["x-forwarded-proto"] == null) {
      args.headers["x-forwarded-proto"] = "http";
    }

    // Dev server-only implementation.
    try {
      return await renderRscToReadableStream({
        ...args,
        headers: new Headers(args.headers),
        body: args.body!,
        routerOptions,
      });
    } catch (error: any) {
      // If you get a codeFrame error during SSR like when using a Class component in React Server Components, then this
      // will throw with:
      // {
      //   rawObject: {
      //     type: 'TransformError',
      //     lineNumber: 0,
      //     errors: [ [Object] ],
      //     name: 'SyntaxError',
      //     message: '...',
      //   }
      // }

      // TODO: Revisit all error handling now that we do direct metro bundling...
      await logMetroError(projectRoot, { error });

      if (error[IS_METRO_BUNDLE_ERROR_SYMBOL]) {
        throw new Response(JSON.stringify(error), {
          status: isPossiblyUnableToResolveError(error) ? 404 : 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const sanitizedServerMessage = stripAnsi(error.message) ?? error.message;
      throw new Response(sanitizedServerMessage, {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
  },
});
```
