# @react-native-rethemed/material-ui-tokens

Material UI's default theme (palette, colors, typography) for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

Material UI's default theme (`createTheme()`, Material Design 2): palette in light and dark mode with Material UI's names (`'primary.main'`, `'text.secondary'`), `@mui/material/colors`, the 13 typography variants as text presets (`button` / `overline` keep `textTransform: 'uppercase'`), spacing, shape and elevations 0–24.

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/material-ui-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { materialUiTheme } from '@react-native-rethemed/material-ui-tokens';

export const themeConfig = materialUiTheme;

// themed.view({ backgroundColor: 'background.paper', padding: 2 })
// themed.text.h6({ color: 'text.secondary' })
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
| `materialUiTheme` | The full theme |
| `semanticColors` | The light/dark `palette` |
| `colors` | `@mui/material/colors` (`'deepPurple.A200'`) |
| `typography` | The 13 variants (`h1`…`overline`) as text presets |
| `spacing`, `radii`, `fontWeights`, `shadows`, `zIndices` | Individual token scales |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/material-ui/example) shows what the CLI generates for `materialUiTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from [Material UI](https://github.com/mui/material-ui) (MIT).
