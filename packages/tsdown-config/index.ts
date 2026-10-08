// Shared tsdown config for the published library packages under
// packages/react-native-rethemed/ (not the CLI, which ships its TS sources).
// Each package's tsdown.config.mts calls `defineLibraryConfig` with its entries.
// Loaded by tsdown's native TypeScript loader (Node.js type stripping), so
// keep it to erasable syntax: no enums, namespaces or parameter properties.
import { defineConfig, type UserConfig } from 'tsdown';

export interface LibraryConfigOptions {
  /**
   * Entry files, relative to the package (e.g. `['src/index.ts', 'src/config.ts']`).
   * Each one becomes a `package.json` export: `src/index.ts` → `.`,
   * `src/config.ts` → `./config`.
   */
  entry: string[];
}

export function defineLibraryConfig({ entry }: LibraryConfigOptions): UserConfig {
  return defineConfig({
    entry,
    // ESM for bundlers and Node; CJS for Jest and other `require` users.
    format: ['esm', 'cjs'],
    // No Node.js assumptions in the ESM output (CJS is always `node`).
    platform: 'neutral',
    // Metro lowers syntax again for Hermes; es2020 keeps the output safe for
    // any consumer toolchain.
    target: 'es2020',
    // One output file per source file, mirroring `src/`.
    unbundle: true,
    dts: true,
    // `.mjs` / `.cjs` (and `.d.mts` / `.d.cts`) instead of `type` markers.
    fixedExtension: true,
    clean: true,
    // The repo's `exports` keep pointing at `src/` for apps, tests and the
    // CLI; the built files go to `publishConfig`, applied by `pnpm publish`.
    // `legacy: false`: tsdown would write top-level `main` / `module` /
    // `types` pointing at dist/; the built ones are set in each package's
    // `publishConfig` by hand.
    exports: { devExports: true, legacy: false },
    // Check package.json fields and exports against the built files
    // (requires `publint` and `@arethetypeswrong/core` in the package).
    publint: true,
    attw: { profile: 'node16', level: 'error' },
  });
}
