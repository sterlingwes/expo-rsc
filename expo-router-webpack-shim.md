You're asking about where expo-router shims webpack-specific globals like `__webpack_require__` that are needed by the `react-server-dom-webpack` package to work with Metro instead of webpack. <cite/>

## Webpack Globals Shimming in RSC Renderer

The main shimming happens in the RSC renderer where expo-router declares and uses webpack-specific globals: [1](#1-0)

These globals are then used directly in the server action loading logic: [2](#1-1)

## Metro Runtime Polyfill

The actual implementation of these webpack globals is provided by `@expo/metro-runtime/rsc/runtime`, which is imported at the top of the RSC renderer: [3](#1-2)

This runtime polyfill provides the webpack-compatible module loading interface that `react-server-dom-webpack` expects, but implemented using Metro's module system instead.

## Global Module Loading Setup

The RSC renderer also sets up a global module loader that bridges Metro's module system with the webpack-style loading expected by server actions:

Additionally, there's a global bundle loading function set up specifically for server module loading: [4](#1-3)

## External Require Shimming

In the RSC middleware, there's also shimming for external requires using a declared `$$require_external` function: [5](#1-4)

This is used in the `serverRequire` function to load modules from the output file system: [6](#1-5)

## Notes

The shimming strategy allows `react-server-dom-webpack` to work with Metro by providing webpack-compatible globals (`__webpack_require__`, `__webpack_chunk_load__`) that internally use Metro's module loading system. This is implemented primarily through `@expo/metro-runtime/rsc/runtime` which acts as the bridge between the two bundler systems.

Wiki pages you might want to explore:

- [Development Workflow (expo/expo)](/wiki/expo/expo#4)

### Citations

**File:** packages/expo-router/src/rsc/rsc-renderer.ts (L13-14)

```typescript
// Import the runtime to support polyfills for webpack to load modules in the server using Metro.
import "@expo/metro-runtime/rsc/runtime";
```

**File:** packages/expo-router/src/rsc/rsc-renderer.ts (L23-26)

```typescript
declare namespace globalThis {
  function __webpack_chunk_load__(id: string): Promise<unknown>;
  function __webpack_require__(id: string): any;
}
```

**File:** packages/expo-router/src/rsc/rsc-renderer.ts (L118-119)

```typescript
// @ts-ignore: Not part of global types. This is added to support server actions loading more actions.
global[`${__METRO_GLOBAL_PREFIX__}__loadBundleAsync`] =
  opts.loadServerModuleRsc;
```

**File:** packages/expo-router/src/rsc/rsc-renderer.ts (L214-217)

```typescript
await Promise.all(
  chunkInfo.chunks.map((chunk) => globalThis.__webpack_chunk_load__(chunk))
);

// Import module.
const mod: any = globalThis.__webpack_require__(chunkInfo.id);
```

**File:** packages/expo-router/src/rsc/middleware.ts (L15-15)

```typescript
declare const $$require_external: typeof require;
```

**File:** packages/expo-router/src/rsc/middleware.ts (L22-26)

```typescript
function serverRequire<T = any>(...targetOutputModulePath: string[]): T {
  // NOTE(@kitten): This `__dirname` will be located in the output file system, e.g. `dist/server/*`
  const filePath = path.join(__dirname, ...targetOutputModulePath);
  return $$require_external(filePath);
}
```
