/**
 * Stands in for `react-native` while the CLI evaluates a theme file in plain
 * Node (see `load-theme.ts`). `react-native`'s entry is Flow source that Node
 * can't parse, but a theme file may import from `@react-native-rethemed/core`,
 * whose root also exports the React Native runtime (`createThemed`). Those
 * imports are only used at render time, never while building a config, so an
 * empty module is enough.
 */
module.exports = {};
