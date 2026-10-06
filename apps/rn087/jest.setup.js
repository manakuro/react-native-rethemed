/* eslint-env jest */
// SafeAreaProvider renders nothing until native insets arrive; use the
// library's mock so screens actually render in tests.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
