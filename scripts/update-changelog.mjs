#!/usr/bin/env node
// Adds the current version's section to the root CHANGELOG.md, newest first,
// from the per-package CHANGELOGs that `changeset version` just wrote.
// Runs as part of `pnpm version-packages`, so the entry lands in the
// "chore: version packages" PR and is on main when the release is published.
// Usage: node scripts/update-changelog.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { packageSections, publishablePackages } from './lib/changelog.mjs';

const FILE = 'CHANGELOG.md';
const HEADER = `# Changelog

All notable changes to the react-native-rethemed packages. Every release
publishes all packages at the same version; see each package's
\`CHANGELOG.md\` for its own history.
`;

const packages = publishablePackages();
const { version } = packages[0];
if (packages.some((pkg) => pkg.version !== version)) {
  throw new Error(`Packages are not on one version: ${packages.map((p) => `${p.name}@${p.version}`).join(', ')}`);
}

const current = existsSync(FILE) ? readFileSync(FILE, 'utf8') : HEADER;
const heading = `## v${version}`;
if (current.split('\n').some((line) => line.trim() === heading)) {
  console.log(`${FILE}: ${heading} already exists, skipped`);
  process.exit(0);
}

const parts = packageSections(packages);
const entry = `${heading}\n\n${parts.length > 0 ? parts.join('\n\n') : 'Dependency updates only.'}\n`;

// Insert before the newest release, i.e. after the header.
const firstRelease = current.search(/^## /m);
const next =
  firstRelease === -1
    ? `${current.trimEnd()}\n\n${entry}`
    : `${current.slice(0, firstRelease)}${entry}\n${current.slice(firstRelease)}`;
writeFileSync(FILE, next);
console.log(`${FILE}: added ${heading}`);
