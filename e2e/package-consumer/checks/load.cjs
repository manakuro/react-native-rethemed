// Every package (except the core root, which needs a React Native runtime)
// loads with `require` and exposes exports.
const packages = require('./packages.json');

for (const name of packages) {
  const keys = Object.keys(require(name));
  if (keys.length === 0) throw new Error(`${name}: no exports via require`);
  console.log(`require ${name}: ${keys.length} exports`);
}
