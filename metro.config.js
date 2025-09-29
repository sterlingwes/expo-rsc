const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const moduleMap = {};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith(".client")) {
    const clientComponentPath = context.resolveRequest(
      context,
      moduleName,
      platform
    );
    if (clientComponentPath) {
      const moduleId = `client:${moduleName}`;
      moduleMap[moduleId] = clientComponentPath.filePath;
      return clientComponentPath;
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

const defaultSerializer =
  config.serializer.customSerializer ||
  require("metro/src/DeltaBundler/Serializers/async");

config.serializer.customSerializer = (entry, pre, graph, options) => {
  const fs = require("fs");
  fs.writeFileSync("./module-map.json", JSON.stringify(moduleMap, null, 2));
  return defaultSerializer(entry, pre, graph, options);
};

module.exports = config;
