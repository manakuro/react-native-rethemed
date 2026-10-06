# @react-native-rethemed/chakra-ui-tokens

Chakra UI's default design tokens for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/chakra-ui-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { extendTheme } from '@react-native-rethemed/core';
import { chakraUiTheme } from '@react-native-rethemed/chakra-ui-tokens';

export const themeConfig = extendTheme(chakraUiTheme, {
  semanticTokens: {
    text: {
      heading: { fontSize: '2xl', fontWeight: 'bold', color: 'fg.default' },
    },
  },
});
```

Then generate the typed bindings (and the token reference for AI agents):

```sh
npx @react-native-rethemed/cli codegen src/theme/theme.ts --docs docs/themed.md
```

and use them in components:

```tsx
import { useThemed } from './theme/themed.gen';

const { themed } = useThemed();
```

See the [main README](https://github.com/manakuro/react-native-rethemed#readme) for the full setup (`ThemedProvider`, color mode, `extendTheme`).

## Exports

| Export | Description |
| --- | --- |
| `chakraUiTheme` | The full theme, ready for `createThemed` / the CLI |
| `colors` | Color palette (`'blue.500'`) |
| `semanticColors` | Light/dark semantic colors (`'fg.default'`, `'bg.subtle'`) |
| `radii`, `spacing`, `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacings`, `shadows`, `zIndices` | Individual token scales |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/chakra-ui/example) shows what the CLI generates for `chakraUiTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from [Chakra UI](https://github.com/chakra-ui/chakra-ui) (MIT).
