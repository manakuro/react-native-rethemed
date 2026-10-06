const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/**
 * Resolved from the app no matter which file imports them:
 * - `react` / `react-native`: workspace packages (`@react-native-rethemed/*`)
 *   have their own devDependency copies, and only one may be bundled.
 * - `react-native-safe-area-context`: a peer of `@react-native-rethemed/example`
 *   with its own native module; one JS copy must pair with it.
 * - `@babel/runtime`: Babel injects its helpers into workspace package
 *   sources, which don't depend on it themselves.
 */
const SINGLETONS = [
  'react',
  'react-native',
  'react-native-safe-area-context',
  '@babel/runtime',
];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // pnpm links workspace packages and `node_modules/.pnpm` from the
  // monorepo root, outside this app.
  watchFolders: [monorepoRoot],
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      const isSingleton = SINGLETONS.some(
        name => moduleName === name || moduleName.startsWith(`${name}/`),
      );
      return context.resolveRequest(
        isSingleton
          ? { ...context, originModulePath: path.join(projectRoot, 'index.js') }
          : context,
        moduleName,
        platform,
      );
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
