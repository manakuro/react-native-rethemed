/**
 * The playground's own chrome (header, drawer, section titles, labels).
 *
 * Kept neutral and separate from the showcased themes, so a theme without
 * colors (Material Design 3) or without semantic colors (Panda CSS) is shown
 * exactly as its package ships it, while the app around it still follows
 * light/dark.
 *
 * Regenerate the typed bindings with `pnpm theme:codegen`.
 */
import { defineTheme } from '@react-native-rethemed/core';

export const themeConfig = defineTheme({
  tokens: {
    colors: { white: '#ffffff', black: '#000000' },
    radii: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    spacing: {
      0: 0,
      0.5: 2,
      1: 4,
      1.5: 6,
      2: 8,
      2.5: 10,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      8: 32,
      10: 40,
    },
    fontSizes: { '2xs': 10, xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24 },
    fontWeights: { normal: '400', medium: '500', semibold: '600', bold: '700' },
    lineHeights: { tight: 1.25, normal: 1.5 },
    zIndices: { base: 0 },
    shadows: {
      sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 16,
      },
    },
  },
  semanticTokens: {
    colors: {
      bg: {
        canvas: { light: '#ffffff', dark: '#09090b' },
        surface: { light: '#fafafa', dark: '#121214' },
        subtle: { light: '#f4f4f5', dark: '#1c1c1f' },
        selected: { light: '#eef2ff', dark: '#1e1b4b' },
        backdrop: { light: 'rgba(9, 9, 11, 0.4)', dark: 'rgba(0, 0, 0, 0.6)' },
      },
      fg: {
        default: { light: '#18181b', dark: '#fafafa' },
        muted: { light: '#52525b', dark: '#a1a1aa' },
        subtle: { light: '#a1a1aa', dark: '#71717a' },
      },
      border: {
        default: { light: '#e4e4e7', dark: '#27272a' },
        subtle: { light: '#f4f4f5', dark: '#1c1c1f' },
      },
      accent: {
        solid: { light: '#4f46e5', dark: '#818cf8' },
        fg: { light: '#4338ca', dark: '#a5b4fc' },
        contrast: { light: '#ffffff', dark: '#1e1b4b' },
      },
    },
  },
  defaults: { fontSize: 'md' },
});
