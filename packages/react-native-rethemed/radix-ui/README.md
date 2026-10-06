# @react-native-rethemed/radix-ui-tokens

Radix UI Themes tokens (Radix Colors scales, typography, radii, shadows) for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

Radix Themes configured like `<Theme>`: accent / gray scales (12 steps + alpha) for light and dark, panel colors, space, radius, the Text / Heading presets and shadows.

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/radix-ui-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { createRadixUiTheme } from '@react-native-rethemed/radix-ui-tokens';

// Like <Theme accentColor="crimson" grayColor="auto" radius="large">
export const themeConfig = createRadixUiTheme({
  accentColor: 'crimson',
  radius: 'large',
  colors: ['green', 'red'], // extra scales for status colors
});

// themed.view({ backgroundColor: 'accent.9', padding: 3 })
// themed.text.heading['4']({ color: 'gray.12' })
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
| `createRadixUiTheme(options)` | Builds a theme from `accentColor`, `grayColor`, `radius`, `scaling` and extra `colors` |
| `radixUiTheme` | `createRadixUiTheme()` with Radix's defaults |
| `getMatchingGrayColor(accent)` | The gray `grayColor: 'auto'` picks |
| `scales` | Every Radix color scale |
| `fontWeights` | Font weights |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/radix-ui/example) shows what the CLI generates for `radixUiTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from [Radix Themes](https://github.com/radix-ui/themes) (MIT).
