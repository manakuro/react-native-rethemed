import {
  defineTheme,
  type SchemeColor,
  type ShadowToken,
  type TextToken,
  type ThemeConfig,
} from '@react-native-rethemed/core/config';
import {
  backgroundColors,
  fontSizes,
  fontWeights,
  headingLetterSpacing,
  headingLineHeights,
  letterSpacings,
  lineHeights,
  radii,
  radiusFactors,
  radiusFull,
  scales,
  scalings,
  shadows,
  space,
} from './tokens.gen';

/** Every Radix color scale. */
export type ScaleName = keyof typeof scales;

/** `<Theme accentColor>`: every scale except the five tinted grays. */
export type AccentColor = Exclude<
  ScaleName,
  'mauve' | 'slate' | 'sage' | 'olive' | 'sand'
>;

/** `<Theme grayColor>`. `auto` picks the gray that matches the accent. */
export type GrayColor =
  | 'auto'
  | Extract<ScaleName, 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand'>;

export type Radius = keyof typeof radiusFactors;
export type Scaling = keyof typeof scalings;

export type RadixUiThemeOptions = {
  /** Default `indigo`. */
  accentColor?: AccentColor;
  /** Default `auto`. */
  grayColor?: GrayColor;
  /** Default `medium`. */
  radius?: Radius;
  /** Default `100%`. */
  scaling?: Scaling;
  /**
   * More scales to use by name (`'red.9'`, `'green.a3'`), e.g. for status
   * colors. `accent`, `gray` and `color` are always included; every scale
   * would add ~870 colors to the generated types, so pick what you use.
   */
  colors?: Exclude<ScaleName, 'gray'>[];
};

/**
 * The gray `grayColor: 'auto'` picks for an accent, as Radix Themes'
 * `getMatchingGrayColor` does.
 */
export function getMatchingGrayColor(
  accentColor: AccentColor,
): Exclude<GrayColor, 'auto'> {
  switch (accentColor) {
    case 'tomato':
    case 'red':
    case 'ruby':
    case 'crimson':
    case 'pink':
    case 'plum':
    case 'purple':
    case 'violet':
      return 'mauve';
    case 'iris':
    case 'indigo':
    case 'blue':
    case 'sky':
    case 'cyan':
      return 'slate';
    case 'teal':
    case 'jade':
    case 'mint':
    case 'green':
      return 'sage';
    case 'grass':
    case 'lime':
      return 'olive';
    case 'yellow':
    case 'amber':
    case 'orange':
    case 'brown':
    case 'gold':
    case 'bronze':
      return 'sand';
    case 'gray':
      return 'gray';
  }
}

const round = (n: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

const scaled = (table: Record<string, number>, factor: number) =>
  Object.fromEntries(
    Object.entries(table).map(([key, value]) => [key, round(value * factor)]),
  );

/** `'gray.a2'` → that step of the theme's gray in `scheme`; hex as-is. */
function grayRef(
  value: string,
  gray: Record<string, SchemeColor>,
  scheme: 'light' | 'dark',
): string {
  return value.startsWith('gray.') ? gray[value.slice(5)][scheme] : value;
}

/** `#rrggbbaa` → `{ color: '#rrggbb', opacity }`. */
function splitAlpha(hex: string): { color: string; opacity: number } {
  if (hex.length !== 9) return { color: hex, opacity: 1 };
  return {
    color: hex.slice(0, 7),
    opacity: round(Number.parseInt(hex.slice(7), 16) / 255, 3),
  };
}

/** Android elevation per shadow level; CSS has none, so picked by hand. */
const SHADOW_ELEVATIONS: Record<string, number> = {
  2: 2,
  3: 4,
  4: 8,
  5: 12,
  6: 16,
};

/**
 * A Radix Themes theme, configured like `<Theme>`:
 *
 * ```ts
 * createRadixUiTheme({ accentColor: 'blue', radius: 'large', colors: ['red'] })
 * ```
 *
 * - `semanticTokens.colors`: `accent` and `gray` (each `1`–`12`, `a1`–`a12`,
 *   `contrast`, `surface`, `indicator`, `track`), `color` (`background`,
 *   `panel-solid`, `panel-translucent`, `surface`, `overlay`), plus the
 *   scales in `colors`. Every one switches with light/dark.
 * - `spacing` (`1`–`9`), `fontSizes` (`1`–`9`) and `radii` (`1`–`6`,
 *   `full`) follow `scaling` and `radius`.
 * - Text presets: `themed.text.text[3]()` is `<Text size="3">` and
 *   `themed.text.heading[3]()` is `<Heading size="3">` (bold, tighter line
 *   height), both with Radix's letter spacing.
 * - `shadows` `2`–`6`: one layer each, light-mode values; `1` is inset and
 *   left out.
 */
export function createRadixUiTheme(
  options: RadixUiThemeOptions = {},
): ThemeConfig {
  const {
    accentColor = 'indigo',
    grayColor = 'auto',
    radius = 'medium',
    scaling = '100%',
    colors = [],
  } = options;
  const factor = scalings[scaling];
  const gray: Record<string, SchemeColor> =
    scales[
      grayColor === 'auto' ? getMatchingGrayColor(accentColor) : grayColor
    ];

  const sizes: Record<string, number> = fontSizes;
  const spacingsEm: Record<string, number> = letterSpacings;
  const preset = (size: string, lineHeight: number, extraEm = 0): TextToken => {
    const fontSize = round(sizes[size] * factor);
    return {
      fontSize,
      lineHeight: round(lineHeight * factor),
      letterSpacing: round((spacingsEm[size] + extraEm) * fontSize, 3),
    };
  };

  return defineTheme({
    tokens: {
      spacing: scaled(space, factor),
      radii: {
        ...scaled(radii, factor * radiusFactors[radius]),
        full: radiusFull[radius],
      },
      fontSizes: scaled(fontSizes, factor),
      fontWeights,
      shadows: Object.fromEntries(
        Object.entries(shadows).map(([key, layer]): [string, ShadowToken] => {
          const { color, opacity } = splitAlpha(
            grayRef(layer.color, gray, 'light'),
          );
          return [
            key,
            {
              shadowColor: color,
              shadowOffset: { width: layer.x, height: layer.y },
              shadowOpacity: opacity,
              shadowRadius: layer.blur / 2,
              elevation: SHADOW_ELEVATIONS[key],
            },
          ];
        }),
      ),
    },
    semanticTokens: {
      colors: {
        accent: scales[accentColor],
        gray,
        color: Object.fromEntries(
          Object.entries(backgroundColors).map(([key, value]) => [
            key,
            {
              light: grayRef(value.light, gray, 'light'),
              dark: grayRef(value.dark, gray, 'dark'),
            },
          ]),
        ),
        ...Object.fromEntries(colors.map((name) => [name, scales[name]])),
      },
      text: {
        text: Object.fromEntries(
          Object.entries(lineHeights).map(([size, lineHeight]) => [
            size,
            preset(size, lineHeight),
          ]),
        ),
        heading: Object.fromEntries(
          Object.entries(headingLineHeights).map(([size, lineHeight]) => [
            size,
            {
              ...preset(size, lineHeight, headingLetterSpacing),
              fontWeight: 'bold',
            },
          ]),
        ),
      },
    },
    defaults: { fontSize: '3' },
  });
}

/** Radix Themes' defaults: `indigo` accent, `slate` gray, `medium` radius, `100%` scaling. */
export const radixUiTheme = createRadixUiTheme();
