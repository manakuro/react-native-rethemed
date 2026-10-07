# @react-native-rethemed/panda-css-tokens

[![npm](https://img.shields.io/npm/v/@react-native-rethemed/panda-css-tokens.svg)](https://www.npmjs.com/package/@react-native-rethemed/panda-css-tokens)

Panda CSS's default theme tokens for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

Panda CSS's default theme (`@pandacss/preset-panda`): colors, radii, spacing, font sizes / weights, line heights, letter spacings and shadows. Panda ships no semantic tokens, so define `semanticTokens` in your app.

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/panda-css-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { extendTheme } from '@react-native-rethemed/core';
import { colors, pandaCssTheme } from '@react-native-rethemed/panda-css-tokens';

// Panda ships no semantic tokens; define the ones your app needs.
export const themeConfig = extendTheme(pandaCssTheme, {
  semanticTokens: {
    colors: {
      fg: { default: { light: colors['gray.900'], dark: colors['gray.50'] } },
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
| `pandaCssTheme` | The full theme |
| `colors` | Color palette as hex (`'red.500'`) |
| `radii`, `spacing`, `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacings`, `shadows` | Individual token scales |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/panda-css/example) shows what the CLI generates for `pandaCssTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from [Panda CSS](https://github.com/chakra-ui/panda) (MIT).
