/**
 * Converts Material UI's default theme (`createTheme()` from
 * `@mui/material/styles`, in light and dark mode) and its color palette
 * (`@mui/material/colors`) into react-native-rethemed tokens. Pure functions
 * only: `generate.ts` writes the result to `src/tokens.gen.ts`, and the tests
 * re-run the conversion to check that the committed file still matches the
 * installed `@mui/material`.
 *
 * Not exported from the package.
 */
import type {
  ShadowToken,
  TextToken,
} from '@react-native-rethemed/core/config';

/** The part of a Material UI theme this converter reads. */
export type MuiTheme = {
  palette: Record<string, unknown>;
  typography: Record<string, unknown> & { htmlFontSize: number };
  spacing: (factor: number) => string;
  shape: { borderRadius: number | string };
  zIndex: Record<string, number>;
  shadows: string[];
};

/** `@mui/material/colors`: hue -> shade -> color. */
export type MuiColors = Record<string, Record<string, string>>;

export type ConvertedTheme = {
  colors: Record<string, string>;
  semanticColors: Record<
    string,
    Record<string, { light: string; dark: string }>
  >;
  typography: Record<string, TextToken>;
  fontWeights: Record<string, string>;
  spacing: Record<string, number>;
  radii: Record<string, number>;
  zIndices: Record<string, number>;
  shadows: Record<string, ShadowToken>;
};

/**
 * Hues in the order of Material UI's color docs
 * (https://mui.com/material-ui/customization/color/#color-palette).
 */
export const HUES = [
  'red',
  'pink',
  'purple',
  'deepPurple',
  'indigo',
  'blue',
  'lightBlue',
  'cyan',
  'teal',
  'green',
  'lightGreen',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deepOrange',
  'brown',
  'grey',
  'blueGrey',
] as const;

/** `palette` intents, each with `main` / `light` / `dark` / `contrastText`. */
export const PALETTE_INTENTS = [
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
] as const;

const INTENT_KEYS = ['main', 'light', 'dark', 'contrastText'] as const;

/**
 * Non-intent palette colors. `text.icon` is left out (dark mode only), and
 * so are the `action.*Opacity` numbers (not colors). `divider` is a single
 * value in Material UI and becomes `divider.default`.
 */
export const PALETTE_GROUPS = {
  text: ['primary', 'secondary', 'disabled'],
  background: ['default', 'paper'],
  action: [
    'active',
    'hover',
    'selected',
    'disabled',
    'disabledBackground',
    'focus',
  ],
} as const;

/** `theme.typography` variants, which become text presets. */
export const TYPOGRAPHY_VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
] as const;

/**
 * `theme.spacing(n)` factors exposed as spacing tokens, so `padding: 2`
 * matches `theme.spacing(2)` (16).
 */
export const SPACING_FACTORS = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12,
] as const;

/**
 * Multiples of `theme.shape.borderRadius` exposed as radius tokens, so
 * `borderRadius: 2` matches `sx={{ borderRadius: 2 }}` (8).
 */
export const RADIUS_FACTORS = [0, 0.5, 1, 1.5, 2, 3, 4] as const;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** `#fff` -> `#ffffff`; anything else (6-digit hex, `rgba()`) unchanged. */
export function normalizeColor(color: string): string {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(color);
  if (!short) return color.toLowerCase();
  const [, r, g, b] = short;
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

/** `'8px'` -> 8. */
export function toPoints(length: string | number): number {
  if (typeof length === 'number') return length;
  const match = /^(-?[\d.]+)px$/.exec(length);
  if (!match) throw new Error(`unsupported length: ${length}`);
  return Number(match[1]);
}

/** `'1.5rem'` -> 24 at the theme's `htmlFontSize`. */
export function remToPoints(value: string, htmlFontSize: number): number {
  const match = /^(-?[\d.]+)rem$/.exec(value);
  if (!match) throw new Error(`unsupported font size: ${value}`);
  return round2(Number(match[1]) * htmlFontSize);
}

/** `'0.00938em'` at 16 -> 0.15. */
export function emToPoints(value: string | number, fontSize: number): number {
  if (typeof value === 'number') return value;
  const match = /^(-?[\d.]+)em$/.exec(value);
  if (!match) throw new Error(`unsupported letter spacing: ${value}`);
  return round2(Number(match[1]) * fontSize) || 0;
}

export function convertColors(colors: MuiColors): Record<string, string> {
  const result: Record<string, string> = {
    black: normalizeColor(colors.common.black),
    white: normalizeColor(colors.common.white),
  };
  for (const hue of HUES) {
    for (const [shade, value] of Object.entries(colors[hue])) {
      result[`${hue}.${shade}`] = normalizeColor(value);
    }
  }
  return result;
}

function paletteValue(theme: MuiTheme, path: string[]): string {
  const value = path.reduce<unknown>(
    (node, key) => (node as Record<string, unknown> | undefined)?.[key],
    theme.palette,
  );
  if (typeof value !== 'string') {
    throw new Error(`palette.${path.join('.')} is not a color`);
  }
  return normalizeColor(value);
}

export function convertSemanticColors(
  light: MuiTheme,
  dark: MuiTheme,
): ConvertedTheme['semanticColors'] {
  const pair = (path: string[]) => ({
    light: paletteValue(light, path),
    dark: paletteValue(dark, path),
  });
  const groups: (readonly [string, readonly string[]])[] = [
    ...PALETTE_INTENTS.map((intent) => [intent, INTENT_KEYS] as const),
    ...Object.entries(PALETTE_GROUPS),
  ];
  return {
    ...Object.fromEntries(
      groups.map(([group, keys]) => [
        group,
        Object.fromEntries(keys.map((key) => [key, pair([group, key])])),
      ]),
    ),
    divider: { default: pair(['divider']) },
  };
}

/**
 * A typography variant -> text preset: rem font sizes and em letter
 * spacings to points, the unitless line height to an absolute one, and
 * `textTransform` kept. `fontFamily` (Roboto) is dropped: RN has no font
 * family token, and Roboto is already Android's default.
 */
export function convertVariant(
  variant: Record<string, unknown>,
  htmlFontSize: number,
): TextToken {
  const fontSize = remToPoints(String(variant.fontSize), htmlFontSize);
  const preset: TextToken = {
    fontSize,
    lineHeight: round2(Number(variant.lineHeight) * fontSize),
    letterSpacing: emToPoints(variant.letterSpacing as string, fontSize),
    fontWeight: String(variant.fontWeight) as TextToken['fontWeight'],
  };
  if (variant.textTransform !== undefined) {
    preset.textTransform = variant.textTransform as TextToken['textTransform'];
  }
  return preset;
}

/** One RN shadow from a CSS box-shadow layer, see `convertShadow`. */
type ShadowLayer = {
  x: number;
  y: number;
  blur: number;
  color: string;
  alpha: number;
};

/** Parses `0px 2px 1px -1px rgba(0,0,0,0.2)`. */
export function parseShadowLayer(layer: string): ShadowLayer {
  const match =
    /^(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+-?[\d.]+px)?\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(
      layer.trim(),
    );
  if (!match) throw new Error(`unsupported box-shadow: ${layer}`);
  const hex = (n: string) => Number(n).toString(16).padStart(2, '0');
  return {
    x: Number(match[1]),
    y: Number(match[2]),
    blur: Number(match[3]),
    // Spread has no RN equivalent and is dropped.
    color: `#${hex(match[4])}${hex(match[5])}${hex(match[6])}`,
    alpha: Number(match[7]),
  };
}

/**
 * `theme.shadows[elevation]` -> one RN shadow. Material UI stacks three
 * layers (umbra, penumbra, ambient); RN has one, so the first is used, like
 * the Panda CSS package. CSS blur is twice RN's `shadowRadius`. Android's
 * `elevation` is the Material elevation itself, so it matches exactly.
 */
export function convertShadow(value: string, elevation: number): ShadowToken {
  if (value === 'none') {
    return {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
  }
  // Layers are comma-separated, but `rgba(...)` contains commas too.
  const [first] = value.split(/,(?![^(]*\))/);
  const layer = parseShadowLayer(first);
  return {
    shadowColor: layer.color,
    shadowOffset: { width: layer.x, height: layer.y },
    shadowOpacity: layer.alpha,
    shadowRadius: layer.blur / 2,
    elevation,
  };
}

export function convertTheme(
  light: MuiTheme,
  dark: MuiTheme,
  colors: MuiColors,
): ConvertedTheme {
  const { typography } = light;
  const borderRadius = toPoints(light.shape.borderRadius);
  return {
    colors: convertColors(colors),
    semanticColors: convertSemanticColors(light, dark),
    typography: Object.fromEntries(
      TYPOGRAPHY_VARIANTS.map((variant) => [
        variant,
        convertVariant(
          typography[variant] as Record<string, unknown>,
          typography.htmlFontSize,
        ),
      ]),
    ),
    fontWeights: {
      light: String(typography.fontWeightLight),
      regular: String(typography.fontWeightRegular),
      medium: String(typography.fontWeightMedium),
      bold: String(typography.fontWeightBold),
    },
    spacing: Object.fromEntries(
      SPACING_FACTORS.map((n) => [n, toPoints(light.spacing(n))]),
    ),
    radii: Object.fromEntries(RADIUS_FACTORS.map((n) => [n, n * borderRadius])),
    zIndices: { ...light.zIndex },
    shadows: Object.fromEntries(
      light.shadows.map((shadow, elevation) => [
        elevation,
        convertShadow(shadow, elevation),
      ]),
    ),
  };
}
