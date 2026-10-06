# @react-native-rethemed/core

Type-safe design tokens for React Native style props — no wrapper components. Light/dark aware, with text presets and a `themed` style API. Part of [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

## Installation

```sh
npm install @react-native-rethemed/core
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies.

## Usage

Define a theme:

```ts
// src/theme/theme.ts
import { defineTheme } from '@react-native-rethemed/core';

export const themeConfig = defineTheme({
  tokens: {
    radii: { md: 6, full: 9999 },
    spacing: { 1: 4, 2: 8, 4: 16 },
    fontSizes: { sm: 14, md: 16 },
    fontWeights: { normal: '400', semibold: '600' },
    lineHeights: { moderate: 1.5 },
  },
  semanticTokens: {
    colors: {
      bg: { default: { light: '#ffffff', dark: '#111111' } },
      fg: { default: { light: '#111111', dark: '#fafafa' } },
    },
    text: {
      title: { fontSize: 'md', lineHeight: 'moderate', fontWeight: 'semibold' },
    },
  },
  defaults: { fontSize: 'md' },
});
```

Generate the typed bindings with [`@react-native-rethemed/cli`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/cli):

```sh
npx @react-native-rethemed/cli codegen src/theme/theme.ts --docs docs/themed.md
```

Then wrap the app and style with tokens:

```tsx
import { Text, View } from 'react-native';
import { ThemedProvider, useThemed } from './theme/themed.gen';

export default function App() {
  return (
    <ThemedProvider>
      <Card />
    </ThemedProvider>
  );
}

function Card() {
  const { themed } = useThemed();
  return (
    <View style={themed.view({ backgroundColor: 'bg.default', padding: 4, borderRadius: 'md' })}>
      <Text style={themed.text.title({ color: 'fg.default' })}>Hello</Text>
    </View>
  );
}
```

Start from a design system with a token package (`@react-native-rethemed/chakra-ui-tokens`, `material-ui-tokens`, `material-design-tokens`, `panda-css-tokens`, `tailwind-css-tokens`, `shadcn-ui-tokens`, `radix-ui-tokens`) and `extendTheme`.

## Entry points

| Import | Contents |
| --- | --- |
| `@react-native-rethemed/core` | Everything: `defineTheme`, `extendTheme`, `createThemed`, `createThemedStyles` and the types |
| `@react-native-rethemed/core/config` | The React / React Native-free part (`defineTheme`, `extendTheme`, token helpers), for theme files and tooling |

See the [main README](https://github.com/manakuro/react-native-rethemed#readme) for color mode, `extendTheme` merge rules and the full API.

## License

MIT
