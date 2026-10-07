#!/usr/bin/env node
// Builds one GitHub release body for a release of the fixed package group,
// from each published package's CHANGELOG.md section for that version.
// Usage: node scripts/release-notes.mjs '<published-packages JSON>'
//   (the `published-packages` output of changesets/action/publish:
//    [{"name":"@react-native-rethemed/core","version":"0.2.0"}, ...])
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGES_DIR = 'packages/react-native-rethemed';
const published = JSON.parse(process.argv[2] ?? '[]');

const dirs = Object.fromEntries(
  ['core', 'cli', 'chakra-ui', 'material-ui', 'material-design', 'panda-css', 'tailwind-css', 'shadcn-ui', 'radix-ui'].map(
    (dir) => [JSON.parse(readFileSync(join(PACKAGES_DIR, dir, 'package.json'), 'utf8')).name, dir],
  ),
);

/** The `## <version>` section of a CHANGELOG, without its heading. */
function section(changelog, version) {
  const lines = changelog.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) return '';
  const end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

/** Drops "Updated dependencies" bullets and the headings they leave empty. */
function withoutDependencyBumps(body) {
  const kept = [];
  let skipping = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('- Updated dependencies')) {
      skipping = true;
      continue;
    }
    if (skipping && (line.startsWith('  ') || line.trim() === '')) continue;
    skipping = false;
    kept.push(line);
  }
  return kept
    .join('\n')
    .split(/\n(?=### )/)
    .filter((block) => !/^### [^\n]*\s*$/.test(block.trim()))
    .join('\n')
    .trim();
}

const order = Object.keys(dirs);
const parts = published
  .filter((pkg) => dirs[pkg.name])
  .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  .map((pkg) => {
    const changelog = readFileSync(join(PACKAGES_DIR, dirs[pkg.name], 'CHANGELOG.md'), 'utf8');
    const body = withoutDependencyBumps(section(changelog, pkg.version)).replace(/^###/gm, '####');
    return body ? `### ${pkg.name}\n\n${body}` : '';
  })
  .filter(Boolean);

const list = published.map((pkg) => `- \`${pkg.name}@${pkg.version}\``).join('\n');
process.stdout.write(
  `${parts.length > 0 ? parts.join('\n\n') : 'Dependency updates only.'}\n\n<details>\n<summary>Published packages</summary>\n\n${list}\n\n</details>\n`,
);
