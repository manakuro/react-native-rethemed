/**
 * Example theme: `shadcnUiTheme` exactly as this package ships it (base color
 * `neutral`, on top of `tailwindCssTheme`), with no app-side additions.
 * `pnpm example:codegen` runs the CLI on this file and writes
 * `themed.gen.ts` and `themed.md` next to it.
 */
import { shadcnUiTheme } from '../src';

export const themeConfig = shadcnUiTheme;
