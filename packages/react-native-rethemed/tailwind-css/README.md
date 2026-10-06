# @react-native-rethemed/tailwind-css-tokens

Tailwind CSS's default theme (colors, spacing, text sizes, shadows) for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

Tailwind CSS's default `theme.css` with Tailwind's names: `padding: 4` is `p-4`, `themed.text.sm()` is `text-sm` (font size plus its paired line height).

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/tailwind-css-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { extendTheme } from '@react-native-rethemed/core';
import { colors, tailwindCssTheme } from '@react-native-rethemed/tailwind-css-tokens';

// Tailwind has no semantic colors (it uses `dark:`), so define your own.
export const themeConfig = extendTheme(tailwindCssTheme, {
  semanticTokens: {
    colors: {
      fg: { default: { light: colors['gray.900'], dark: colors['gray.50'] } },
    },
  },
});

// themed.view({ padding: 4, borderRadius: 'lg' })   // p-4 rounded-lg
// themed.text.sm({ color: 'fg.default' })           // text-sm
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
| `tailwindCssTheme` | The full theme |
| `colors` | The oklch palette as hex (`'sky.500'`) |
| `text` | `text-*` presets with paired line heights |
| `spacing`, `radii`, `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacings`, `shadows` | Individual token scales |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/tailwind-css/example) shows what the CLI generates for `tailwindCssTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) (MIT).
