import { extendTheme } from '@react-native-rethemed/core/config';
import { tailwindCssTheme } from '@react-native-rethemed/tailwind-css-tokens';
import { baseColors, radii } from './tokens.gen';

/** A shadcn/ui base color: `neutral` (the default), `stone`, `zinc`, … */
export type BaseColor = keyof typeof baseColors;

/** The default base color's semantic colors (`neutral`). */
export const semanticColors = baseColors.neutral;

/**
 * shadcn/ui's default theme (base color `neutral`), converted for React
 * Native. shadcn/ui is Tailwind CSS plus CSS variables, so this is
 * `tailwindCssTheme` (spacing, typography, shadows, the color palette) with
 * shadcn/ui's colors and radii on top, the same layering as a shadcn/ui
 * project's `globals.css`.
 *
 * - Semantic colors use shadcn/ui's names as top-level colors, so styles
 *   read like the class names: `bg-primary text-primary-foreground` is
 *   `themed.view({ backgroundColor: 'primary' })` /
 *   `themed.text({ color: 'primary-foreground' })`. oklch is converted to
 *   hex; translucent dark-mode borders become 8-digit hex.
 * - `radii`: `--radius` (10) and the `radius-sm`…`radius-4xl` scale derived
 *   from it replace Tailwind's, like shadcn/ui's `@theme inline`.
 * - Other base colors: `baseColors.zinc`, … — switch with
 *   `extendTheme(shadcnUiTheme, { semanticTokens: { colors: baseColors.zinc } })`.
 * - Values come from the shadcn/ui registry snapshot in `scripts/registry/`
 *   (`pnpm sync`), converted by `scripts/generate.ts`.
 */
export const shadcnUiTheme = extendTheme(tailwindCssTheme, {
  tokens: { radii },
  semanticTokens: { colors: semanticColors },
});

export { baseColors, radii };
