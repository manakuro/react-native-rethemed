// Type-checked with `moduleResolution: nodenext` as an ES module, so the
// packages' `import` types (`.d.mts`) are used.
import { defineTheme, type ThemeConfig } from '@react-native-rethemed/core/config';
import { tailwindCssTheme } from '@react-native-rethemed/tailwind-css-tokens';

const theme: ThemeConfig = tailwindCssTheme;
export const checked = defineTheme(theme);
