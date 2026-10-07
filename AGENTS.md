# AGENTS.md

This file provides guidance to AI coding assistants when working with this repository.

## Supported AI Assistants

This file is referenced by multiple AI coding assistants:

- **Claude Code** (claude.ai/code) — Also reads `CLAUDE.md` for additional instructions
- **GitHub Copilot** — Workspace-level instructions
- **Cursor** — Project rules and context
- **Windsurf** — Codebase instructions
- **Other AI assistants** — Following the AGENTS.md convention

> **Note**: Claude Code reads both `AGENTS.md` and `CLAUDE.md`. If you need Claude-specific instructions, add them to `CLAUDE.md`. Instructions in `AGENTS.md` apply to all AI assistants.

---

## Project Overview

`react-native-rethemed` — design tokens for React Native style props, with no wrapper components. A theme is declared with `defineTheme`, the CLI generates typed bindings (`themed.gen.ts`), and components resolve tokens through `themed.view({ padding: 4, backgroundColor: 'bg.panel' })` etc. Semantic colors switch with light/dark.

| Package | npm name | Location | Purpose |
|---------|----------|----------|---------|
| core | `@react-native-rethemed/core` | `packages/react-native-rethemed/core/` | Runtime: `createThemed`, `createThemedStyles`, `defineTheme`, `extendTheme`, resolvers, color-mode store |
| cli | `@react-native-rethemed/cli` | `packages/react-native-rethemed/cli/` | `react-native-rethemed codegen` — generates `themed.gen.ts` and an optional Markdown token reference |
| chakra-ui | `@react-native-rethemed/chakra-ui-tokens` | `packages/react-native-rethemed/chakra-ui/` | `chakraUiTheme` (Chakra UI tokens + semantic colors) |
| material-ui | `@react-native-rethemed/material-ui-tokens` | `packages/react-native-rethemed/material-ui/` | `materialUiTheme`, converted from `@mui/material`'s `createTheme()` (Material Design 2) |
| material-design | `@react-native-rethemed/material-design-tokens` | `packages/react-native-rethemed/material-design/` | `materialDesignTheme` (Material Design 3 type scale, spacing) |
| tailwind-css | `@react-native-rethemed/tailwind-css-tokens` | `packages/react-native-rethemed/tailwind-css/` | `tailwindCssTheme`, converted from `tailwindcss/theme.css` |
| shadcn-ui | `@react-native-rethemed/shadcn-ui-tokens` | `packages/react-native-rethemed/shadcn-ui/` | `shadcnUiTheme`: `tailwindCssTheme` + shadcn/ui semantic colors (top-level names) and radii; `baseColors` for all seven base colors |
| radix-ui | `@react-native-rethemed/radix-ui-tokens` | `packages/react-native-rethemed/radix-ui/` | `createRadixUiTheme(options)` (like `<Theme>` props) and `radixUiTheme` (defaults), from `@radix-ui/themes`' token CSS |
| panda-css | `@react-native-rethemed/panda-css-tokens` | `packages/react-native-rethemed/panda-css/` | `pandaCssTheme`, converted from `@pandacss/preset-panda` |
| biome-config | `biome-config` (private) | `packages/biome-config/` | Shared Biome config extended by every package |
| example | `@react-native-rethemed/example` (private) | `packages/example/` | The playground screen (`<Playground />`) and its themes, shared by every app in `apps/` |
| apps | e.g. `rn087` | `apps/rn<version>/` | One React Native app per RN version, each rendering `<Playground />` |

Tooling: pnpm workspaces (with `catalog:` for `react` / `react-native`) + Turborepo, TypeScript, Biome, Vitest, Lefthook, Commitizen.

---

## Quick Commands

### Monorepo (Root)

```bash
pnpm install          # Install dependencies
pnpm build            # Build library packages to dist/ (cjs + esm + d.ts)
pnpm lint             # Lint all packages (Biome)
pnpm lint:fix         # Fix lint issues
pnpm test             # Run Vitest (watch)
pnpm test:ci          # Run Vitest once
pnpm tsc              # TypeScript check (tsc --noEmit)
pnpm cz               # Commit with Commitizen (conventional commits)
pnpm changeset        # Add a changeset for a user-facing change
```

### Per package

Run with `pnpm --filter <npm name> <script>` or from the package directory.

```bash
pnpm lint / lint:fix / tsc / test / test:ci   # Available in every package
pnpm example:codegen  # token packages: regenerate example/themed.gen.ts and example/themed.md
pnpm generate         # panda-css / material-ui / tailwind-css: regenerate src/tokens.gen.ts from the upstream package
```

---

## Architecture Guidelines

### core

- `src/config.ts` (`@react-native-rethemed/core/config`) is the **React / React Native-free** entry point. Token packages import from it. App theme files may import from the package root (`@react-native-rethemed/core`): the CLI aliases `react-native` to an empty stub (`cli/src/react-native-stub.cjs`) when evaluating them.
- `src/index.ts` re-exports `config` plus the React-dependent API (`createThemed`, `createThemedStyles`).
- Token resolution lives in `src/resolvers/`; style-prop → token-key mapping in `src/style-props.ts`; text presets in `src/text-tree.ts` / `src/text-variants.ts`.
- Type-level tests live in `src/__type-tests__/` and are checked by `tsc`.

### cli

- Entry: `bin/react-native-rethemed.mjs` → `src/cli.ts`. Pipeline: `load-theme` (via jiti) → `validate` → `model` → `generate` / `emit` (+ `docs` for `--docs`).
- `src/__fixtures__/` holds a sample theme and its committed output; `themed.gen.ts` there is generated and excluded from Biome.

### Token packages (chakra-ui, material-ui, material-design, panda-css, tailwind-css, shadcn-ui, radix-ui)

- Each exports one theme built with `defineTheme` from `src/index.ts`.
- `example/` contains `theme.ts` (input), generated `themed.gen.ts` / `themed.md` (committed), and `usage.tsx` (type-checked usage sample). Tests fail when the committed output is stale — run `pnpm example:codegen` after changing the theme or the CLI.
- panda-css: `src/tokens.gen.ts` is generated by `scripts/generate.ts` (using `scripts/convert.ts`). Do not edit it by hand; bump `@pandacss/preset-panda` and run `pnpm generate`.
- tailwind-css: same layout; `scripts/convert.ts` parses the `@theme default` CSS variables in `tailwindcss/theme.css`. Bump `tailwindcss` and run `pnpm generate`.
- shadcn-ui: shadcn/ui is not on npm, so `scripts/sync.ts` snapshots the registry JSON (from the shadcn-ui/ui repo, pinned to a commit in `scripts/registry/source.json`) and `scripts/generate.ts` converts the snapshot. Run `pnpm sync` then `pnpm generate`.
- radix-ui: `scripts/convert.ts` reads `@radix-ui/themes/tokens/*.css` (cascade, `var()` and `color-mix()` evaluated at generate time) into raw data in `src/tokens.gen.ts`; `src/theme.ts` (`createRadixUiTheme`) applies accent / gray / radius / scaling. Bump `@radix-ui/themes` and run `pnpm generate`.
- material-ui: same layout; `scripts/generate.ts` runs `createTheme()` from the `@mui/material` devDependency in light and dark mode. Bump `@mui/material` and run `pnpm generate`.
- Export names: primitive values use the `ThemeConfig.tokens` key (`colors`, `spacing`, `radii`, …); semantic values keep the design system's own name (`semanticColors`, `typescale`, `typography`); the theme is `<designSystem>Theme`.
- When adding a new token package, follow the same layout (`src/`, `example/`, `biome.json` extending `biome-config`, `lint` / `tsc` / `test` / `example:codegen` scripts), and add matching commands to `lefthook.yml`.

### example and apps

- `packages/example` holds the whole playground: `playground.tsx`, the drawer and token showcase (`src/components/`, `src/showcase/`), the showcased themes (`src/themes/<id>/`) and the playground's own neutral theme (`src/shell/`). Its `*.gen.ts` files and `docs/themes/*.md` are generated by `pnpm --filter @react-native-rethemed/example theme:codegen` (also run on `prepare`).
- To showcase a new theme: add `src/themes/<id>/theme.ts`, add its codegen command to `theme:codegen`, run it, and register it in `src/themes/index.ts`.
- `apps/rn<version>` are thin React Native apps: `App.tsx` only renders `<Playground />`. When adding an app for a new RN version, copy `metro.config.js`, `jest.config.js`, `jest.setup.js` and the `paths` in `tsconfig.json` from an existing app: they pin `react`, `react-native`, `react-native-safe-area-context` and `@babel/runtime` to the app's own copies, since workspace packages have their own devDependency versions.
- Apps use the React Native template's ESLint / Prettier / Jest setup, not Biome.

---

## Code Style

- **Linter / Formatter**: Biome (not ESLint / Prettier). Each package's `biome.json` extends `packages/biome-config/biome.json`.
- Single quotes, trailing commas, space indentation.
- **Colocation**: Keep related files close to where they are used. Tests sit next to the source as `*.test.ts`; a token package's `example/` lives inside the package; each playground theme keeps its `theme.ts`, `themed.gen.ts` and `preview.tsx` together in `packages/example/src/themes/<id>/`. Move code to a shared place only once more than one place uses it.
- **Naming**: Use `kebab-case` for files and folders, including React components (`theme-menu.tsx` exports `ThemeMenu`). Biome's `useFilenamingConvention` enforces it for JS/TS files. Exceptions: the `__fixtures__` / `__type-tests__` folders, upper-case docs (`README.md`, `CHANGELOG.md`, `AGENTS.md`, …), and the React Native template files in `apps/*` (`App.tsx`, `__tests__/`).
- Never edit `*.gen.ts` files by hand — regenerate them.
- Run `pnpm lint:fix` before committing. Lefthook runs Biome and `tsc` on staged files per package in `pre-commit`.
- Commit messages follow Conventional Commits (`pnpm cz`).

---

## Important Notes

- Use pnpm (not npm or yarn). Node.js version is pinned in `.node-version` / `package.json` `engines`.
- `react` and `react-native` versions come from the `catalog:` in `pnpm-workspace.yaml`; core declares them as peer dependencies.
- License: MIT. Token packages convert values from upstream design systems — keep the upstream copyright notices.

---

## Publishing

- The 9 packages under `packages/react-native-rethemed/` are published to npm; `example`, `biome-config` and `apps/*` are private.
- In the repo, `main` / `exports` point at `src/*.ts` (apps, tests and the CLI use the sources). `publishConfig` overrides them with `dist/` at publish time, and `prepack` runs `build` (`scripts/build-package.mjs` + `tsconfig.build.json`). The CLI is published as TypeScript sources and run through jiti (`files`: `bin`, `src`).
- When adding a library package: copy `tsconfig.build.json` and the `build` / `prepack` / `files` / `publishConfig` fields from an existing token package, and depend on internal packages with `workspace:^`.
- Full release procedure: `docs/releasing.md`.
- Versioning uses Changesets with all public packages in one `fixed` group (same version). Add a changeset (`pnpm changeset`) to any PR with a user-facing change.
- Releases run in CI (`.github/workflows/release.yml`): pushes to main open/update a "chore: version packages" PR; merging it publishes to npm via Trusted Publishing (OIDC, no token), pushes per-package git tags and creates one GitHub release `v<version>` (notes from `scripts/release-notes.mjs`). `pnpm version-packages` also adds a `## v<version>` section to the root `CHANGELOG.md` (`scripts/update-changelog.mjs`). CHANGELOG entries link the PR, commit and author (`@changesets/changelog-github`), so a manual `version-packages` needs a token: `GITHUB_TOKEN=$(gh auth token) pnpm version-packages`. Manual fallback: `pnpm version-packages` → commit → `pnpm release` → `git push --follow-tags`.

---

## Additional Documentation

- `CLAUDE.md` — Claude Code specific instructions
- `docs/releasing.md` — Changesets, the release workflow, manual release and npm Trusted Publishing setup
- `packages/react-native-rethemed/*/example/README.md` — What the CLI generates for each token package
- `.claude/agents/`, `.claude/commands/`, `.claude/skills/` — Claude Code agents, commands and skills (`changeset`: add a changeset for the current branch; `/pr`: push the branch and open a PR from the template)
