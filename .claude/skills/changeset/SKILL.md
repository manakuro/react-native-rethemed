---
name: changeset
description: Add a Changesets entry (.changeset/*.md) for the current branch's changes to the published @react-native-rethemed/* packages. Use when the user asks to add a changeset, prepare a PR for release, or when a feature, fix, API or type change to a published package is ready to commit.
---

# Add a changeset

Versions and CHANGELOGs are managed with Changesets. Each PR that changes a published package adds its own changeset, in the same PR as the change. Background: `docs/releasing.md`.

## 1. Decide whether a changeset is needed

Look at what the branch changes compared to `main`:

```sh
git fetch origin main --quiet
git diff --stat origin/main...HEAD
git status --short
```

A changeset is needed only when the change affects users of a **published package**: a feature, a bug fix, or a change to the API, types, generated output (CLI) or token values.

The published packages live in `packages/react-native-rethemed/<dir>`:

| dir | package |
| --- | --- |
| `core` | `@react-native-rethemed/core` |
| `cli` | `@react-native-rethemed/cli` |
| `chakra-ui` | `@react-native-rethemed/chakra-ui-tokens` |
| `material-ui` | `@react-native-rethemed/material-ui-tokens` |
| `material-design` | `@react-native-rethemed/material-design-tokens` |
| `panda-css` | `@react-native-rethemed/panda-css-tokens` |
| `tailwind-css` | `@react-native-rethemed/tailwind-css-tokens` |
| `shadcn-ui` | `@react-native-rethemed/shadcn-ui-tokens` |
| `radix-ui` | `@react-native-rethemed/radix-ui-tokens` |

No changeset is needed for:
- tests, `example/` output and `scripts/` (dev tooling) of those packages
- refactors without behavior changes
- docs, CI, repo config
- `packages/example`, `packages/biome-config` and `apps/*` (all private)

If none is needed, tell the user why and stop. If `.changeset/` already has a file for this change, update it instead of adding another.

## 2. Pick packages and bump types

- List only the packages whose published code changed. All packages are in one `fixed` group, so every package gets the new version anyway. The list decides which CHANGELOGs show the entry.
- Bump type, while the packages are on 0.x (`^0.1.0` only matches `0.1.x`):
  - `minor`: a breaking change (removed or renamed export, changed types or behavior, changed token names or values), or a large new feature
  - `patch`: a bug fix, or a compatible small addition
  - `major`: only when the user explicitly decides to release 1.0.0
- When unsure between `minor` and `patch`, ask the user. Say which exports or behavior break.

## 3. Write the changeset

Write the file directly; `pnpm changeset` is interactive. Use a short kebab-case name that describes the change:

```md
<!-- .changeset/add-style-variants.md -->
---
"@react-native-rethemed/core": minor
---

Add variants to `createThemedStyles`.
```

- Use **one changeset per change**. If the branch has two unrelated changes, write two files.
- The summary becomes the CHANGELOG line and the GitHub release note:
  - one line, in English, imperative mood ("Add …", "Fix …", "Rename …")
  - user-facing: what changed for someone using the package, not how it was implemented
  - wrap code (exports, props, CLI flags, token names) in backticks
- For a breaking change, add a short migration note below the first line:

  ```md
  Rename `semanticColors` to `colors` in `@react-native-rethemed/chakra-ui-tokens`.

  Migration: replace `import { semanticColors }` with `import { colors }`.
  ```

- Don't add `pr:` / `commit:` / `author:` lines. `@changesets/changelog-github` finds them from the commit that adds the file. Add them only when writing a changeset for changes that were **already merged** in another PR (e.g. `pr: #12` on its own line before the summary).

## 4. Verify

```sh
pnpm changeset status --verbose
```

Check that the listed packages and bump types match what you intended. All packages show the same new version, because of the `fixed` group. Then tell the user the file name, the packages, the bump types, and the summary, and commit the file with the change.
