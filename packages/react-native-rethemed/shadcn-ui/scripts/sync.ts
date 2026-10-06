/**
 * Refreshes the registry snapshot in `scripts/registry/` from shadcn/ui.
 *
 *   pnpm --filter @react-native-rethemed/shadcn-ui-tokens sync
 *
 * shadcn/ui is not an npm package: its CLI fetches base colors from the
 * registry (`ui.shadcn.com/r/colors/<base>.json`) at runtime, and the
 * registry is not versioned. The same files are built into the shadcn-ui/ui
 * repository, so this pins the current `main` commit and fetches them from
 * there (`SHADCN_COMMIT=<sha>` picks another commit). `pnpm generate` then works from the snapshot, offline and
 * reproducibly. Review the diff, then run `pnpm generate`.
 *
 * Not exported from the package.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_COLORS } from './convert';

const REPO = 'shadcn-ui/ui';
const REGISTRY_PATH = 'apps/v4/public/r/colors';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, 'registry');

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { 'user-agent': 'react-native-rethemed' },
  });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.json();
}

// `SHADCN_COMMIT=<sha> pnpm sync` pins a specific commit instead of `main`.
const sha =
  process.env.SHADCN_COMMIT ??
  (
    (await getJson(`https://api.github.com/repos/${REPO}/commits/main`)) as {
      sha: string;
    }
  ).sha;

for (const base of BASE_COLORS) {
  const url = `https://raw.githubusercontent.com/${REPO}/${sha}/${REGISTRY_PATH}/${base}.json`;
  const { cssVarsV4 } = (await getJson(url)) as { cssVarsV4: unknown };
  if (!cssVarsV4) throw new Error(`${url} has no cssVarsV4`);
  writeFileSync(
    resolve(outDir, `${base}.json`),
    `${JSON.stringify(cssVarsV4, null, 2)}\n`,
  );
}

writeFileSync(
  resolve(outDir, 'source.json'),
  `${JSON.stringify(
    {
      repository: `https://github.com/${REPO}`,
      commit: sha,
      path: REGISTRY_PATH,
      registry: 'https://ui.shadcn.com/r/colors/<base>.json',
      syncedAt: new Date().toISOString().slice(0, 10),
    },
    null,
    2,
  )}\n`,
);

console.log(`Synced ${BASE_COLORS.length} base colors from ${REPO}@${sha}`);
