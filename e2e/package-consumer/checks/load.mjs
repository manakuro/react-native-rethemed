// Every package (except the core root) loads with `import` in Node ESM.
import { createRequire } from 'node:module';

const packages = createRequire(import.meta.url)('./packages.json');

for (const name of packages) {
  const keys = Object.keys(await import(name));
  if (keys.length === 0) throw new Error(`${name}: no exports via import`);
  console.log(`import ${name}: ${keys.length} exports`);
}
