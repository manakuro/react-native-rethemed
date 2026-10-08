const { getDefaultConfig } = require('@react-native/metro-config');

// The default config, as in a freshly created app: no resolver tweaks, so the
// packages must work the way users get them.
module.exports = getDefaultConfig(__dirname);
