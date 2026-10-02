/**
 * The app's theme: Chakra UI tokens (colors with light/dark semantic colors,
 * radii, spacing, typography, shadows, z-indices).
 *
 * Add or override tokens in the second argument, then regenerate the typed
 * bindings with `pnpm theme:codegen`.
 */
import { extendTheme } from '@react-native-rethemed/core';
import { chakraUiTheme } from '@react-native-rethemed/chakra-ui-tokens';

export const themeConfig = extendTheme(chakraUiTheme, {
  // App-specific tokens go here, e.g.
  // semanticTokens: { colors: { brand: { solid: { light: '...', dark: '...' } } } },
});
