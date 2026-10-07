# Contributing

Thanks for your interest in react-native-rethemed! Bug reports, feature requests, new token packages and documentation fixes are all welcome.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Bugs:** open an [issue](https://github.com/manakuro/react-native-rethemed/issues). Include the package versions, a minimal theme or snippet, and what you expected to happen.
- **Features and new token packages:** please open an issue first, so we can agree on the API before you spend time on it.
- **Small fixes** (typos, docs, obvious bugs): feel free to open a PR directly.

## Development setup

Requirements:

- **Node.js:** the version in [`.node-version`](.node-version)
- **pnpm:** the version in `packageManager` in `package.json`. Run `corepack enable` and the right version is used automatically. Don't use npm or yarn.

[Fork the repository](https://github.com/manakuro/react-native-rethemed/fork), then:

```sh
git clone https://github.com/<your-username>/react-native-rethemed.git
cd react-native-rethemed
git remote add upstream https://github.com/manakuro/react-native-rethemed.git
npm install -g corepack@latest
corepack enable pnpm
pnpm install
pnpm lefthook install
```

`pnpm install` also runs the playground's codegen.

### Repository layout

| Path | What it is |
| --- | --- |
| `packages/react-native-rethemed/core` | Runtime: `defineTheme`, `extendTheme`, `createThemed` |
| `packages/react-native-rethemed/cli` | `react-native-rethemed codegen` |
| `packages/react-native-rethemed/<design-system>` | Token packages (`chakra-ui`, `material-ui`, `material-design`, `panda-css`, `tailwind-css`, `shadcn-ui`, `radix-ui`) |
| `packages/example` | The playground screen and its themes (private) |
| `apps/rn<version>` | React Native apps that render the playground, one per RN version (private) |

[`AGENTS.md`](AGENTS.md) describes each package's structure and conventions in more detail.

## Common commands

From the repository root:

```sh
pnpm lint        # Biome
pnpm lint:fix    # Biome, with fixes
pnpm tsc         # Type-check
pnpm test:ci     # Vitest, once
pnpm build       # Build the library packages to dist/
```

For a single package, use `pnpm --filter <package name> <script>`:

```sh
pnpm --filter @react-native-rethemed/core test
```

### Token packages

- Each package's `example/` holds generated `themed.gen.ts` / `themed.md`. They are committed, and tests fail when they are stale. After changing a theme or the CLI, regenerate them:

  ```sh
  pnpm --filter @react-native-rethemed/<name> example:codegen
  ```

- `src/tokens.gen.ts` is generated from the upstream package (`pnpm generate`; shadcn-ui also needs `pnpm sync` first). Never edit `*.gen.ts` files by hand.

### Running the playground

The playground shows every token package in a React Native app:

```sh
cd apps/rn087
bundle install && cd ios && bundle exec pod install && cd ..   # first time, iOS only
pnpm start
pnpm ios     # or: pnpm android
```

## Making a change

1. Create a branch from an up-to-date `main` (`git pull upstream main`).
2. Make your change, with tests where it makes sense. Tests sit next to the source as `*.test.ts`.
3. Make sure the checks pass:

   ```sh
   pnpm lint && pnpm tsc && pnpm test:ci
   ```

   The pre-commit hook runs Biome and `tsc` on the packages you touched.
4. **Add a changeset** if the change affects users of a published package (see below).
5. Commit, push, and open a pull request against `main`.

### Code style

Biome formats and lints the code (`pnpm lint:fix`). Beyond that, follow the [Code Style](AGENTS.md#code-style) section of `AGENTS.md`; in short:

- **Colocation**: keep related files close to where they are used (tests next to the source, examples inside their package).
- **Naming**: `kebab-case` for files and folders, including components (`theme-menu.tsx`).

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `build:`, `ci:`. `pnpm cz` walks you through writing one.

```
feat(core): add variants to createThemedStyles
fix(cli): report the missing token key in validation errors
```

### Changesets

Versions and CHANGELOGs are managed with [Changesets](https://changesets.dev). If your PR changes the behavior, API or types of a published package, add a changeset:

```sh
pnpm changeset
```

1. Pick the package(s) you changed.
2. Pick a bump type. While the packages are on 0.x:
   - `minor`: a breaking change or a large feature
   - `patch`: a fix or a compatible small addition
3. Write a one-line summary for the CHANGELOG.

Commit the generated `.changeset/*.md` file with your change. Docs, tests, CI and internal refactors don't need a changeset.

Releases are done by the maintainer; see [`docs/releasing.md`](docs/releasing.md) if you are curious how they work.

## Pull requests

- Keep each PR focused on one change. Separate refactors from behavior changes.
- Fill in the PR template: a summary, related issues, and how you tested it.
- CI runs lint, type-check, tests and the build for every package. All checks must pass before merging.
- For visual changes, a screenshot of the playground helps a lot.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
