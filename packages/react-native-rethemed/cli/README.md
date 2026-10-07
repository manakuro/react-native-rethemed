# @react-native-rethemed/cli

[![npm](https://img.shields.io/npm/v/@react-native-rethemed/cli.svg)](https://www.npmjs.com/package/@react-native-rethemed/cli)

Code generator for [react-native-rethemed](https://github.com/manakuro/react-native-rethemed). Reads your theme and writes:

- **`themed.gen.ts`** — token types, a JSDoc table of tokens and values on every token-aware prop (shown in editor hovers and autocomplete), and the ready-to-use `ThemedProvider` / `useThemed` / `useColorMode`.
- **A token reference for AI agents** (`--docs`) — every token with its light/dark values, every text preset, and the rules for using them. Reference it from your `DESIGN.md` so coding agents use tokens instead of hard-coded values.

## Installation

```sh
npm install @react-native-rethemed/core
npm install --save-dev @react-native-rethemed/cli
```

## Usage

```sh
npx @react-native-rethemed/cli codegen src/theme/theme.ts --docs docs/themed.md
```

We recommend a script run from `prepare`, so the bindings are regenerated on every install:

```json
{
  "scripts": {
    "theme:codegen": "react-native-rethemed codegen src/theme/theme.ts --docs docs/themed.md",
    "prepare": "npm run theme:codegen"
  }
}
```

The theme file is evaluated directly (TypeScript is supported, no build step), and validated before anything is written — for example, a text preset that references a missing `fontSizes` key fails with a clear message.

## Options

```
Usage: react-native-rethemed codegen <theme-file> [options]

Options:
  -o, --out <file>      Output file (default: <theme-dir>/themed.gen.ts)
  -d, --docs <file>     Also write a Markdown token reference for AI
                        agents and humans (e.g. docs/themed.md)
  -e, --export <name>   Export holding the config (default: the default
                        export, or the only ThemeConfig-looking export)
      --core <module>   Core module specifier used by the generated file
                        (default: @react-native-rethemed/core)
  -h, --help            Show this help
```

See the [main README](https://github.com/manakuro/react-native-rethemed#readme) for the generated API.

## License

MIT
