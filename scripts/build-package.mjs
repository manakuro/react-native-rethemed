#!/usr/bin/env node
// Builds a library package into dist/ for publishing:
//   dist/esm  ES modules + .d.ts  (relative specifiers rewritten to .js for Node ESM)
//   dist/cjs  CommonJS + .d.ts
// Run from the package directory (via its `build` script). Expects a
// tsconfig.build.json next to package.json.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const pkgDir = process.cwd();
const dist = join(pkgDir, 'dist');
const tsc = createRequire(join(pkgDir, 'package.json')).resolve('typescript/bin/tsc');

function run(args) {
  execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json', ...args], {
    cwd: pkgDir,
    stdio: 'inherit',
  });
}

rmSync(dist, { recursive: true, force: true });

run(['--outDir', 'dist/esm', '--module', 'esnext', '--moduleResolution', 'bundler']);
run(['--outDir', 'dist/cjs', '--module', 'node16', '--moduleResolution', 'node16']);

writeFileSync(join(dist, 'esm/package.json'), `${JSON.stringify({ type: 'module' })}\n`);
writeFileSync(join(dist, 'cjs/package.json'), `${JSON.stringify({ type: 'commonjs' })}\n`);

// Node ESM needs explicit extensions; tsc keeps the extensionless specifiers
// that Metro and bundlers accept, so rewrite them in the ESM output.
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*)\2/g;

function withExtension(file, spec) {
  if (/\.(c|m)?js$/.test(spec)) return spec;
  const target = resolve(dirname(file), spec);
  if (existsSync(`${target}.js`)) return `${spec}.js`;
  if (existsSync(join(target, 'index.js'))) return `${spec}/index.js`;
  throw new Error(`Cannot resolve "${spec}" from ${file}`);
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (/\.(js|d\.ts)$/.test(name)) {
      const source = readFileSync(file, 'utf8');
      const rewritten = source.replace(
        SPECIFIER,
        (_, prefix, quote, spec) => `${prefix}${quote}${withExtension(file, spec)}${quote}`,
      );
      if (rewritten !== source) writeFileSync(file, rewritten);
    }
  }
}

walk(join(dist, 'esm'));
