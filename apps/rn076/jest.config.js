module.exports = {
  // RN 0.76 ships its Jest preset inside `react-native`
  // (`@react-native/jest-preset` starts with later versions).
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // pnpm stores packages under `node_modules/.pnpm/<id>/node_modules/<name>`,
  // which the preset's default pattern doesn't account for.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native(-community)?|react-native-safe-area-context)/)',
  ],
  // Resolve these from the app for workspace packages too (see the
  // SINGLETONS comment in metro.config.js).
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native-safe-area-context$':
      '<rootDir>/node_modules/react-native-safe-area-context',
    '^@babel/runtime/(.*)$': '<rootDir>/node_modules/@babel/runtime/$1',
  },
};
