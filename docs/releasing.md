# Releasing

How the packages under `packages/react-native-rethemed/` are versioned and published to npm.

## Overview

- **Published packages (9):** `@react-native-rethemed/core`, `cli`, `chakra-ui-tokens`, `material-ui-tokens`, `material-design-tokens`, `panda-css-tokens`, `tailwind-css-tokens`, `shadcn-ui-tokens`, `radix-ui-tokens`. `packages/example`, `packages/biome-config` and `apps/*` are private and never published.
- **Versioning:** [Changesets](https://changesets.dev). All published packages are in one `fixed` group (`.changeset/config.json`), so they always share one version: a change to `core` alone still releases every package at the new version.
- **Publishing:** GitHub Actions (`.github/workflows/release.yml`) with npm [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). There is no npm token; provenance is attached automatically.
- **Per release:**
  - npm: every package at the new version
  - git tags: one per package, `@react-native-rethemed/<name>@<version>`
  - GitHub release: one per version, tag `v<version>`, title `<version>` (e.g. tag `v0.2.0`, title `0.2.0`)
  - CHANGELOG: `packages/react-native-rethemed/*/CHANGELOG.md`, with links to the PR, commit and author ([`@changesets/changelog-github`](https://www.npmjs.com/package/@changesets/changelog-github))

## 1. Add a changeset to your PR

Every PR with a user-facing change needs a changeset. Docs, CI and refactors without behavior changes don't.

```sh
pnpm changeset
```

1. Pick a package. Because of the `fixed` group, the choice only affects which CHANGELOG the entry goes to; all packages get the new version.
2. Pick the bump type (see below).
3. Write a one-line summary. It becomes the CHANGELOG entry and the release note.

This creates `.changeset/<random-name>.md`. Commit it with the change:

```md
---
"@react-native-rethemed/core": minor
---

Add variants to `createThemedStyles`.
```

The file can also be written by hand, or added to the PR on GitHub.

### Bump types while on 0.x

`^0.1.0` only matches `0.1.x`, so on 0.x a **minor** bump behaves like a major one for consumers.

| Change | Bump | Example |
| --- | --- | --- |
| Breaking change, or a large new feature | `minor` | 0.1.0 → 0.2.0 |
| Bug fix, compatible small addition | `patch` | 0.1.0 → 0.1.1 |
| Going 1.0 | `major` | 0.x → 1.0.0 |

When several changesets are pending, the largest bump wins.

## 2. The release workflow

`release.yml` runs on **every push to main**. It does not react to a particular PR; it looks at the state of main:

1. **`select-mode`** decides what to do:
   - `.changeset/*.md` files exist → **version**
   - no changesets, and a package's version in `package.json` is not on npm yet → **publish**
   - otherwise → nothing
2. **version** runs `pnpm version-packages` (`changeset version` + lockfile update). It consumes the changesets, bumps every version, and writes the CHANGELOGs. The result goes to the `changeset-release/main` branch as the **"chore: version packages"** PR. There is only ever one such PR: more merged changesets update it in place.
3. **pack** runs `pnpm pack` for every package. This runs `prepack` (the build) and applies `publishConfig` and the `workspace:^` rewriting.
4. **publish**:
   - publishes the tarballs to npm via OIDC
   - pushes the per-package git tags
   - creates the `v<version>` GitHub release. The notes come from `scripts/release-notes.mjs`: one section per package from its CHANGELOG, without "Updated dependencies" lines, plus a collapsed list of the published packages.

## 3. Release

1. Merge PRs with changesets. The "chore: version packages" PR opens or updates itself.
2. Review the version PR: the versions, the CHANGELOGs, and the dependency ranges.
   - Pending changes can pile up; the release happens when this PR is merged.
   - The PR is created with `GITHUB_TOKEN`, so `ci.yml` does not run on it automatically.
3. Merge the version PR. The workflow publishes.
4. Check the result:

   ```sh
   npm view @react-native-rethemed/core version
   ```

   and the [Releases](https://github.com/manakuro/react-native-rethemed/releases) page. A newly published version can take a few minutes to show up on npm.

## Manual release (fallback)

Use this only when the workflow can't run.

```sh
# 1. Version. changelog-github needs a GitHub token.
GITHUB_TOKEN=$(gh auth token) pnpm version-packages
git add -A && git commit -m "chore: version packages"

# 2. Publish to npm (needs `npm login` with access to the @react-native-rethemed org)
pnpm release

# 3. Push the commit and the per-package tags
git push --follow-tags
```

- npm 2FA is browser-based: `--otp` is ignored. When the auth URL appears, press ENTER, sign in, and tick **"skip 2FA for 5 minutes"** so the remaining packages don't each ask again.
- If `pnpm release` stops halfway, run it again. Already published packages are skipped.
- For a moment after publishing, npm may show a `0.0.0-stage` placeholder for a package before the real version appears. Wait a few minutes; it is not an approval queue (`npm stage list` is empty).

Then create the GitHub release by hand, from the commit the packages were published from (example for 0.2.0):

```sh
mkdir -p .tmp
V=0.2.0
P='['; for p in core cli chakra-ui-tokens material-ui-tokens material-design-tokens panda-css-tokens tailwind-css-tokens shadcn-ui-tokens radix-ui-tokens; do P="$P{\"name\":\"@react-native-rethemed/$p\",\"version\":\"$V\"},"; done; P="${P%,}]"
node scripts/release-notes.mjs "$P" > .tmp/notes.md
gh release create "v$V" --title "$V" --target "$(git rev-list -n1 "@react-native-rethemed/core@$V")" --notes-file .tmp/notes.md
```

- `git rev-list -n1 <tag>` prints the commit the tag points at. Without `--target`, the `v<version>` tag would be created on the latest commit of main instead.
- `.tmp/` is git-ignored.

## One-time setup

These are already done for the current packages. They are listed for reference and for adding a package.

- **npm Trusted Publishing:** each package trusts `release.yml`. Requires npm ≥ 11.15.0 and 2FA:

  ```sh
  npm trust github @react-native-rethemed/<name> --repo manakuro/react-native-rethemed --file release.yml --allow-publish -y
  ```

  The same can be set in the package's settings on npmjs.com ("Trusted Publisher").
- **GitHub:** Settings → Actions → General → Workflow permissions. Keep "Read repository contents and packages permissions", and enable "Allow GitHub Actions to create and approve pull requests" (needed for the version PR).

### Adding a new package

1. Copy `tsconfig.build.json` and the `build` / `prepack` / `files` / `publishConfig` fields from an existing token package. Depend on internal packages with `workspace:^`.
2. Add the package to:
   - the package directory list in `scripts/release-notes.mjs`
   - the `ci.yml` matrix
   - the package list in this file
3. Trusted Publishing can only be configured for a package that already exists on npm, so **publish its first version manually** (`pnpm release`). Then run `npm trust github …` for it. Later releases go through the workflow.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| No version PR after merging | No changeset in the merged PR, or the "Allow GitHub Actions to create and approve pull requests" setting is off |
| Version job fails with "Please create a GitHub personal access token" | `GITHUB_TOKEN` is missing for `@changesets/changelog-github` (the version step sets it; set it yourself for a manual `version-packages`) |
| Publish fails with 401/403/404 from npm | The package has no trusted publisher for `release.yml`, or the workflow file was renamed |
| `pnpm release` waits at an auth URL | Browser 2FA: press ENTER and approve in the browser (see above) |
