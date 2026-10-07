# @react-native-rethemed/material-design-tokens

[![npm](https://img.shields.io/npm/v/@react-native-rethemed/material-design-tokens.svg)](https://www.npmjs.com/package/@react-native-rethemed/material-design-tokens)

Material Design 3 type scale and tokens for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

Material Design 3's baseline type scale — 5 roles (display / headline / title / body / label) × 3 sizes (lg / md / sm) — and spacing.

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/material-design-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { materialDesignTheme } from '@react-native-rethemed/material-design-tokens';

export const themeConfig = materialDesignTheme;

// themed.text.title.lg()
// themed.text.body.md()
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
| `materialDesignTheme` | The full theme |
| `typescale` | The type scale as text presets |
| `spacing` | Spacing scale |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/material-design/example) shows what the CLI generates for `materialDesignTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from the [Material Design 3](https://m3.material.io/) specification.
