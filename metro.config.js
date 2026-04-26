const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Fix: @expo/vector-icons vendor resolution fails on Windows/OneDrive.
// The file exists on disk but Metro can't resolve relative './vendor/...' imports
// from within the package. We manually resolve them here.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith('./vendor/') &&
    context.originModulePath.includes('@expo' + path.sep + 'vector-icons')
  ) {
    const fromDir = path.dirname(context.originModulePath);
    const target = path.resolve(fromDir, moduleName);

    for (const ext of ['.js', '.ts', '.tsx', '.jsx', '.json']) {
      if (fs.existsSync(target + ext)) {
        return { filePath: target + ext, type: 'sourceFile' };
      }
    }

    const indexJs = path.join(target, 'index.js');
    if (fs.existsSync(indexJs)) {
      return { filePath: indexJs, type: 'sourceFile' };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
