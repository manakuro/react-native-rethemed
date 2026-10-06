/**
 * Example theme: `tailwindCssTheme` exactly as this package ships it, with no
 * app-side additions. `pnpm example:codegen` runs the CLI on this file and
 * writes `themed.gen.ts` and `themed.md` next to it.
 *
 * Tailwind has no semantic colors (it uses `dark:` variants), so color props
 * take the primitive palette (`'sky.500'`), which is the same in light and
 * dark. A real app usually adds `semanticTokens.colors` with
 * `extendTheme(tailwindCssTheme, { ... })`.
 */
import { tailwindCssTheme } from '../src';

export const themeConfig = tailwindCssTheme;
