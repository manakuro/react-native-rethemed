// Imports the package root (not `/config`) like an app would; the CLI stubs
// `react-native` when it evaluates this file.
import { extendTheme } from '@react-native-rethemed/core';
import { colors, tailwindCssTheme } from '@react-native-rethemed/tailwind-css-tokens';

export const themeConfig = extendTheme(tailwindCssTheme, {
  semanticTokens: {
    colors: {
      fg: { default: { light: colors['gray.900'], dark: colors['gray.50'] } },
      bg: { default: { light: colors.white, dark: colors['gray.950'] } },
    },
  },
});
