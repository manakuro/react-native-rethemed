import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { App, THEMES } from '../src/app';

// Jest's `require`; @types/node would clash with React Native's globals.
declare const require: { resolve(id: string): string };

test('resolves the CommonJS build', () => {
  expect(require.resolve('@react-native-rethemed/core')).toMatch(/dist\/index\.cjs$/);
  expect(THEMES).toHaveLength(6);
});

test('renders a themed component', async () => {
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<App />);
  });
  expect(JSON.stringify(renderer?.toJSON())).toContain('Hello from');
  expect(JSON.stringify(renderer?.toJSON())).toContain('scheme colors');
});
