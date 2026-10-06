/**
 * Converts the shadcn/ui registry snapshot (`scripts/registry/<base>.json`,
 * each the registry's `cssVarsV4`) into react-native-rethemed tokens. Pure
 * functions only: `generate.ts` writes the result to `src/tokens.gen.ts`,
 * and the tests re-run the conversion to check that the committed file
 * still matches the snapshot.
 *
 * Not exported from the package.
 */
import type { SchemeColor } from '@react-native-rethemed/core/config';
import { formatHex, formatHex8, parse, toGamut } from 'culori';

/** The base colors shadcn/ui offers (`tailwind.baseColor`); `neutral` is the default. */
export const BASE_COLORS = [
  'neutral',
  'stone',
  'zinc',
  'mauve',
  'olive',
  'mist',
  'taupe',
] as const;

export type BaseColor = (typeof BASE_COLORS)[number];

/** CSS root font size used to turn `rem` into RN points. */
export const BASE_FONT_SIZE = 16;

/**
 * shadcn/ui's `@theme inline` radius scale, as multiples of `--radius`
 * (https://ui.shadcn.com/docs/theming#radius).
 */
export const RADIUS_SCALE = {
  sm: 0.6,
  md: 0.8,
  lg: 1,
  xl: 1.4,
  '2xl': 1.8,
  '3xl': 2.2,
  '4xl': 2.6,
} as const;

/** A registry file's `cssVarsV4`: CSS variable name -> value, per scheme. */
export type CssVars = {
  light: Record<string, string>;
  dark: Record<string, string>;
};

/** Rounds away floating-point noise. */
const round = (n: number, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

const toSrgb = toGamut('rgb', 'oklch');

/**
 * Any CSS color → hex, since RN has no `oklch()`. Colors outside sRGB are
 * gamut-mapped (CSS Color 4 algorithm) instead of clipped. Translucent colors
 * (`oklch(1 0 0 / 10%)`) become 8-digit hex.
 */
export function toHex(css: string): string {
  const parsed = parse(css);
  if (!parsed) throw new Error(`unsupported color: ${css}`);
  const rgb = toSrgb(parsed);
  return (rgb.alpha ?? 1) < 1 ? formatHex8(rgb) : formatHex(rgb);
}

/** `'0.625rem'` → 10. */
export function toPoints(value: string): number {
  const match = /^(-?\d*\.?\d+)(rem|px)$/.exec(value.trim());
  if (!match) throw new Error(`unsupported length: ${value}`);
  const n = Number(match[1]);
  return round(match[2] === 'rem' ? n * BASE_FONT_SIZE : n);
}

/**
 * Every color variable as a top-level semantic color with its shadcn/ui
 * name (`primary`, `primary-foreground`, `chart-1`, `sidebar-ring`), in
 * registry order. `radius` is not a color and is left out.
 */
export function convertColors(vars: CssVars): Record<string, SchemeColor> {
  const colors: Record<string, SchemeColor> = {};
  for (const [name, light] of Object.entries(vars.light)) {
    if (name === 'radius') continue;
    const dark = vars.dark[name];
    if (dark === undefined) throw new Error(`no dark value for --${name}`);
    colors[name] = { light: toHex(light), dark: toHex(dark) };
  }
  return colors;
}

/** `--radius` and the `radius-*` scale derived from it, in points. */
export function convertRadii(vars: CssVars): Record<string, number> {
  const radius = toPoints(vars.light.radius);
  return Object.fromEntries(
    Object.entries(RADIUS_SCALE).map(([name, factor]) => [
      name,
      round(radius * factor),
    ]),
  );
}

export type ConvertedTheme = {
  baseColors: Record<BaseColor, Record<string, SchemeColor>>;
  radii: Record<string, number>;
};

export function convertRegistry(
  registry: Record<BaseColor, CssVars>,
): ConvertedTheme {
  return {
    baseColors: Object.fromEntries(
      BASE_COLORS.map((base) => [base, convertColors(registry[base])]),
    ) as ConvertedTheme['baseColors'],
    // `--radius` is the same in every base color; read it from the default.
    radii: convertRadii(registry.neutral),
  };
}
