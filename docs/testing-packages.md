# Testing the published packages

In the repo, every package's `exports` point at `src/*.ts` (tsdown's `devExports`), so apps, tests and the CLI never touch the built `dist/` files. These checks cover what npm users actually install.

| Check | When | Covers |
| --- | --- | --- |
| publint + attw | every `pnpm build` (tsdown) | `package.json` fields and `exports` match the built files; types resolve for every module resolution mode |
| **Package smoke test** (`pnpm smoke`) | every PR and push to main (CI job `package-smoke`, a required check) | the packed tarballs in a real React Native app: Node, types, CLI, Jest, Metro, Hermes |
| Manual device test | before a release with packaging or runtime changes | the packages running in an app on a simulator or device |

## Package smoke test

```sh
pnpm smoke          # build, pack, install and check
pnpm smoke --keep   # keep the temp directory to debug a failure
```

`scripts/smoke-test.mjs`:

1. Builds the library packages and runs `pnpm pack` for all 9 published packages. This gives the same tarballs as a release: `prepack`, `publishConfig` and `workspace:^` rewriting are applied.
2. Copies [`e2e/package-consumer`](../e2e/package-consumer) to a temp directory outside the repo, runs `npm ci`, and installs the tarballs with npm. Nothing can resolve to the workspace sources.
3. Checks that:
   1. every package loads with `require` and `import` in Node (`checks/load.cjs`, `checks/load.mjs`)
   2. `react-native-rethemed codegen` works on `src/theme.ts`, a theme importing the core root and a token package
   3. `src/`, the tests and `checks/*.mts` type-check with moduleResolution `bundler`, `node16` and `nodenext` (`skipLibCheck: false`; errors inside React Native's own declarations are ignored)
   4. Jest with `@react-native/jest-preset`, unchanged, renders a themed component (CommonJS build, no `transformIgnorePatterns` for our packages)
   5. `react-native bundle` builds iOS and Android bundles with the default Metro config
   6. `hermesc` compiles both bundles to Hermes bytecode (skipped locally where `hermes-compiler` has no binary, such as Linux arm64; required in CI)

### The consumer app

`e2e/package-consumer` is a minimal React Native **0.87.1** app with default configs (Metro, Babel, Jest). It is not part of the pnpm workspace, and its dependencies are pinned in its own `package-lock.json`.

- `src/app.tsx` imports every package (all token package themes, the core root and `/config`) and renders a component that uses `View`, `Text`, `Platform` and the generated `useThemed`.
- `src/themed.gen.ts` is generated during the test and git-ignored.

To update React Native or another dependency, edit `e2e/package-consumer/package.json` and regenerate the lockfile **with a cutoff at least two days old**. CI's safe-chain refuses packages published in the last 48 hours.

```sh
cd e2e/package-consumer
npm install --package-lock-only --before="$(date -u -v-3d +%Y-%m-%dT%H:%M:%SZ)"   # macOS
# Linux: --before="$(date -u -d '3 days ago' +%Y-%m-%dT%H:%M:%SZ)"
```

When adding a published package, add it to `checks/packages.json` and import it in `src/app.tsx`.

## Manual device test

Use this before a release that changes the build, `exports` or runtime code, or to try a fix in your own app.

1. Build and pack the packages:

   ```sh
   pnpm build
   mkdir -p .tmp/tarballs
   for dir in packages/react-native-rethemed/*/; do (cd "$dir" && pnpm pack --pack-destination ../../../.tmp/tarballs); done
   ```

2. Install the tarballs into a React Native or Expo app **outside this repo**. Install all of them in one command, so `@react-native-rethemed/core` comes from the tarball and not from npm:

   ```sh
   cd /path/to/your-app
   npm install /path/to/react-native-rethemed/.tmp/tarballs/*.tgz
   ```

   With pnpm, use `pnpm add /path/to/…/*.tgz`. With Yarn, use `yarn add file:/path/to/…/<name>.tgz` for each tarball.
3. Generate the bindings, then start Metro with a clean cache and run the app:

   ```sh
   npx react-native-rethemed codegen src/theme/theme.ts --docs docs/themed.md
   npx react-native start --reset-cache    # Expo: npx expo start -c
   ```

4. Check light and dark mode, text presets, and a release build (`--mode Release` / `--variant release`) so Hermes runs the bytecode.

Reinstall the tarballs after every rebuild: npm copies them into `node_modules`, so they don't update on their own. `.tmp/` is git-ignored.

## When the smoke test fails

| Step | Likely cause |
| --- | --- |
| Pack / install | A package's `files` misses something, or a dependency range can't be satisfied |
| 1. Load | `exports` / `publishConfig` points at a missing file, or the ESM and CJS builds differ |
| 2. CLI | The CLI can't load the built core, or the theme import path changed |
| 3. Type-check | A `.d.mts` / `.d.cts` is wrong or missing, or a public type changed |
| 4. Jest | The CommonJS build uses ESM-only syntax or a dependency that Jest can't load |
| 5. Metro | Metro can't resolve an export (file extension, condition) or a file imports Node built-ins |
| 6. Hermes | The output uses syntax Hermes doesn't support even after Metro's Babel transform |

Run `pnpm smoke --keep` and re-run the failing command inside the kept `consumer/` directory.
