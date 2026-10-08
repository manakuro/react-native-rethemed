/* eslint-env jest */
// SafeAreaProvider renders nothing until native insets arrive; use the
// library's mock so screens actually render in tests.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// RN 0.76's Jest setup runs `requestAnimationFrame` on real timers, so the
// playground's `Animated` drawer keeps scheduling frames after a test ends
// ("Cannot log after tests are done"). Fake timers keep them inside the test.
jest.useFakeTimers();
