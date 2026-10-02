/**
 * A theme importing from the core root, which also pulls in `react-native`
 * (via `createThemed`). Loaded by `loadTheme` with `react-native` stubbed.
 */
import { defineTheme } from '@react-native-rethemed/core';

export const themeConfig = defineTheme({ tokens: { spacing: { 1: 4 } } });
