#!/usr/bin/env node
// Package smoke test: checks what npm users actually get.
//
// Packs every published package, installs the tarballs with npm into a copy of
// e2e/package-consumer (a React Native app outside the workspace, so nothing
// resolves to the workspace sources), and checks that they:
//   1. load with `require` and `import` in Node
//   2. work with the CLI (`codegen` on a theme that imports the packages)
//   3. type-check with moduleResolution bundler / node16 / nodenext
//   4. load in Jest with the React Native preset
//   5. bundle with Metro for iOS and Android
//   6. compile to Hermes bytecode
//
// Usage: pnpm smoke [--keep]   (--keep leaves the temp directory for debugging)
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = join(root, 'e2e/package-consumer');
const packagesDir = join(root, 'packages/react-native-rethemed');
const keep = process.argv.includes('--keep');

const work = mkdtempSync(join(tmpdir(), 'rethemed-smoke-'));
const tarballs = join(work, 'tarballs');
const app = join(work, 'consumer');

function step(title) {
  console.log(`\n▶ ${title}`);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, { stdio: 'inherit', ...options });
}

/** Type errors outside React Native's own declarations (which have a few). */
function typeCheck(project) {
  let output = '';
  try {
    execFileSync('npx', ['tsc', '-p', project], { cwd: app, encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  const errors = output
    .split('\n')
    .filter((line) => /^\S+\(\d+,\d+\): error TS/.test(line))
    .filter((line) => !line.startsWith('node_modules/react-native/'));
  if (errors.length > 0) throw new Error(`${project}:\n${errors.join('\n')}`);
  console.log(`${project}: OK`);
}

function hermesc() {
  const dir = { darwin: 'osx-bin', linux: 'linux64-bin', win32: 'win64-bin' }[process.platform];
  const binary = join(app, 'node_modules/hermes-compiler/hermesc', dir ?? '', process.platform === 'win32' ? 'hermesc.exe' : 'hermesc');
  // hermes-compiler ships x64 Linux binaries only.
  if (!dir || !existsSync(binary) || (process.platform === 'linux' && process.arch !== 'x64')) {
    if (process.env.CI) throw new Error(`hermesc is not available on ${process.platform}/${process.arch}`);
    console.warn(`hermesc is not available on ${process.platform}/${process.arch}; skipped`);
    return null;
  }
  return binary;
}

try {
  step('Build the packages');
  run('pnpm', ['turbo', 'run', 'build', '--filter=./packages/react-native-rethemed/*'], { cwd: root });

  step('Pack the packages');
  mkdirSync(tarballs);
  for (const dir of readdirSync(packagesDir)) {
    if (!existsSync(join(packagesDir, dir, 'package.json'))) continue;
    run('pnpm', ['pack', '--pack-destination', tarballs], { cwd: join(packagesDir, dir), stdio: 'ignore' });
  }
  const files = readdirSync(tarballs).map((file) => join(tarballs, file));
  console.log(files.map((file) => `  ${file.slice(tarballs.length + 1)}`).join('\n'));

  step('Install them into the consumer app with npm');
  cpSync(fixture, app, { recursive: true, filter: (src) => !src.includes('node_modules') });
  run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: app });
  run('npm', ['install', '--no-save', '--no-audit', '--no-fund', ...files], { cwd: app });

  step('1. Load with require / import');
  run('node', ['checks/load.cjs'], { cwd: app });
  run('node', ['checks/load.mjs'], { cwd: app });

  step('2. CLI codegen');
  run('npx', ['react-native-rethemed', 'codegen', 'src/theme.ts', '--docs', 'themed.md'], { cwd: app });

  step('3. Type-check');
  for (const project of ['tsconfig.bundler.json', 'tsconfig.node16.json', 'tsconfig.nodenext.json']) {
    typeCheck(project);
  }

  step('4. Jest (@react-native/jest-preset)');
  run('npx', ['jest', '--ci'], { cwd: app });

  step('5. Metro bundle');
  for (const platform of ['ios', 'android']) {
    run('npx', ['react-native', 'bundle', '--platform', platform, '--dev', 'false', '--entry-file', 'index.js', '--bundle-output', `${platform}.bundle.js`], { cwd: app });
  }

  step('6. Hermes bytecode');
  const binary = hermesc();
  if (binary) {
    for (const platform of ['ios', 'android']) {
      run(binary, ['-emit-binary', '-O', '-w', '-out', `${platform}.hbc`, `${platform}.bundle.js`], { cwd: app });
      console.log(`${platform}.hbc: OK`);
    }
  }

  console.log('\n✔ Package smoke test passed');
} finally {
  if (keep) console.log(`\nKept ${work}`);
  else rmSync(work, { recursive: true, force: true });
}
