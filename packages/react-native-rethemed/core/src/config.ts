/**
 * `@react-native-rethemed/core/config` — the React/RN-free part of core.
 *
 * Apps can import everything from the package root: the CLI stubs
 * `react-native` when it evaluates a theme file. Core's own token packages
 * still import from here so they never depend on that stub.
 */
export { defineTheme } from './define-theme';
export { extendTheme } from './extend-theme';
export {
  RN_DEFAULT_FONT_SIZE,
  resolveBaseFontSize,
} from './resolvers/line-height-resolver';
export { isSchemeColor, walkSemanticColors } from './semantic-colors';
export {
  COLOR_KEYS,
  FONT_SIZE_KEYS,
  FONT_WEIGHT_KEYS,
  LETTER_SPACING_KEYS,
  LINE_HEIGHT_KEYS,
  RADIUS_KEYS,
  SHADOW_STYLE_PROPS,
  SPACING_KEYS,
  Z_INDEX_KEYS,
} from './style-props';
export {
  isTextPreset,
  resolveTextColor,
  TEXT_TOKEN_FIELDS,
  walkTextPresets,
} from './text-tree';
export type {
  LooseSchema,
  SchemeColor,
  SemanticColors,
  ShadowToken,
  TextColor,
  TextToken,
  TextTokenTree,
  ThemeConfig,
  ThemedSchema,
  ThemedStyles,
  TokenizeStyle,
} from './types';
