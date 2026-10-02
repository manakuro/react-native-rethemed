module.exports = {
  preset: '@react-native/jest-preset',
  // pnpm stores packages under `node_modules/.pnpm/<id>/node_modules/<name>`,
  // which the preset's default pattern doesn't account for.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native(-community)?|react-native-safe-area-context)/)',
  ],
  // Resolve these from the app for workspace packages too (see the
  // SINGLETONS comment in metro.config.js).
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^@babel/runtime/(.*)$': '<rootDir>/node_modules/@babel/runtime/$1',
  },
};
