#!/usr/bin/env node
// Builds one GitHub release body for a release of the fixed package group,
// from each published package's CHANGELOG.md section for that version.
// Usage: node scripts/release-notes.mjs '<published-packages JSON>'
//   (the `published-packages` output of changesets/action/publish:
//    [{"name":"@react-native-rethemed/core","version":"0.2.0"}, ...])
import { packageSections } from './lib/changelog.mjs';

const published = JSON.parse(process.argv[2] ?? '[]');
const parts = packageSections(published);
const list = published.map((pkg) => `- \`${pkg.name}@${pkg.version}\``).join('\n');

process.stdout.write(
  `${parts.length > 0 ? parts.join('\n\n') : 'Dependency updates only.'}\n\n<details>\n<summary>Published packages</summary>\n\n${list}\n\n</details>\n`,
);
