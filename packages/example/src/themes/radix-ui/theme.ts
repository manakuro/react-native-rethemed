/**
 * Radix Themes' defaults (`indigo` accent, `slate` gray, `medium` radius,
 * `100%` scaling) from `@react-native-rethemed/radix-ui-tokens`, plus the
 * `green`, `amber` and `red` scales for status colors.
 *
 * Regenerate the typed bindings with `pnpm theme:codegen`.
 */
import { createRadixUiTheme } from '@react-native-rethemed/radix-ui-tokens';

export const themeConfig = createRadixUiTheme({
  colors: ['green', 'amber', 'red'],
});
