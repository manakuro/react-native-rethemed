// Shared by scripts/release-notes.mjs (GitHub release body) and
// scripts/update-changelog.mjs (root CHANGELOG.md): reads each package's
// Changesets-generated CHANGELOG.md section for a version.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGES_DIR = 'packages/react-native-rethemed';

/** Published packages' directories, in the order they are listed. */
const DIRS = [
  'core',
  'cli',
  'chakra-ui',
  'material-ui',
  'material-design',
  'panda-css',
  'tailwind-css',
  'shadcn-ui',
  'radix-ui',
];

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

/** `[{ name, version, dir }]` for every published package, in list order. */
export function publishablePackages() {
  return DIRS.map((dir) => {
    const { name, version } = readJson(join(PACKAGES_DIR, dir, 'package.json'));
    return { name, version, dir };
  });
}

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

/**
 * One `### <package>` section per package (headings inside demoted to
 * `####`), in list order. Packages whose only change is "Updated
 * dependencies" are left out.
 * @param {{ name: string, version: string }[]} released
 */
export function packageSections(released) {
  const dirs = new Map(publishablePackages().map((pkg) => [pkg.name, pkg.dir]));
  const order = [...dirs.keys()];
  return released
    .filter((pkg) => dirs.has(pkg.name))
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
    .map((pkg) => {
      const changelog = readFileSync(join(PACKAGES_DIR, dirs.get(pkg.name), 'CHANGELOG.md'), 'utf8');
      const body = withoutDependencyBumps(section(changelog, pkg.version)).replace(/^###/gm, '####');
      return body ? `### ${pkg.name}\n\n${body}` : '';
    })
    .filter(Boolean);
}
