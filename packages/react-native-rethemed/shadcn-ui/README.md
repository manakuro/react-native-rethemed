# @react-native-rethemed/shadcn-ui-tokens

shadcn/ui's theme (semantic colors, radii, all base colors) for React Native, ready for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed).

shadcn/ui is Tailwind CSS plus CSS variables, so `shadcnUiTheme` is `tailwindCssTheme` with shadcn/ui's light/dark semantic colors (named like the class names: `'primary'`, `'muted-foreground'`) and `--radius` scale on top. All seven base colors are exported as `baseColors`.

## Installation

```sh
npm install @react-native-rethemed/core @react-native-rethemed/shadcn-ui-tokens
npm install --save-dev @react-native-rethemed/cli
```

`react` and `react-native` are peer dependencies of `@react-native-rethemed/core`.

## Usage

```ts
// src/theme/theme.ts
import { shadcnUiTheme } from '@react-native-rethemed/shadcn-ui-tokens';

export const themeConfig = shadcnUiTheme;

// bg-primary text-primary-foreground rounded-md px-4
// themed.view({ backgroundColor: 'primary', borderRadius: 'md', paddingHorizontal: 4 })
// themed.text.sm({ color: 'primary-foreground' })
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
| `shadcnUiTheme` | The full theme (base color `neutral`) |
| `semanticColors` | The `neutral` semantic colors |
| `baseColors` | Semantic colors for every base color (`baseColors.zinc`, …) |
| `radii` | The `--radius` scale |

[`example/`](https://github.com/manakuro/react-native-rethemed/tree/main/packages/react-native-rethemed/shadcn-ui/example) shows what the CLI generates for `shadcnUiTheme` (`themed.gen.ts`, `themed.md`).

## License

MIT. Token values are converted from [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT).
