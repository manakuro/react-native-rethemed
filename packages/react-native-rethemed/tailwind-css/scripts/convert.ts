/**
 * Converts Tailwind CSS's default theme (`tailwindcss/theme.css`, the
 * `@theme default { … }` CSS variables) into react-native-rethemed tokens.
 * Pure functions only: `generate.ts` writes the result to
 * `src/tokens.gen.ts`, and the tests re-run the conversion to check that
 * the committed file still matches the installed `tailwindcss`.
 *
 * Not exported from the package.
 */
import type {
  ShadowToken,
  TextToken,
} from '@react-native-rethemed/core/config';
import { formatHex, formatHex8, parse, toGamut } from 'culori';

/** CSS root font size used to turn `rem`/`em` into RN points. */
export const BASE_FONT_SIZE = 16;

/**
 * Theme variable namespaces with no token-aware RN style prop (or no RN
 * equivalent at all), so they are not converted.
 */
export const EXCLUDED_NAMESPACES = [
  'animate',
  'aspect',
  'blur',
  'breakpoint',
  'container',
  'default',
  'drop-shadow',
  'ease',
  'font',
  'inset-shadow',
  'perspective',
  'text-shadow',
] as const;

/**
 * Tailwind's spacing is `--spacing` × n for any n (`p-13`). These are the
 * steps Tailwind's docs list (and v3 shipped), so the token types stay
 * readable; `px` is 1px.
 */
export const SPACING_STEPS = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24,
  28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
] as const;

/**
 * Utilities whose values are built in rather than theme variables
 * (`rounded-none`, `rounded-full`, `leading-none`), added so the names work
 * the same as in Tailwind.
 */
export const UTILITY_RADII = { none: 0, full: 9999 } as const;
export const UTILITY_LINE_HEIGHTS = { none: 1 } as const;

/**
 * Android `elevation` per shadow token. CSS has no equivalent, so these are
 * picked by hand, the same as the Panda CSS package (whose shadows are
 * Tailwind's).
 */
export const SHADOW_ELEVATIONS: Record<string, number> = {
  '2xs': 1,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
};

export type ConvertedTheme = {
  colors: Record<string, string>;
  spacing: Record<string, number>;
  radii: Record<string, number>;
  fontSizes: Record<string, number>;
  fontWeights: Record<string, string>;
  lineHeights: Record<string, number>;
  letterSpacings: Record<string, number>;
  shadows: Record<string, ShadowToken>;
  text: Record<string, TextToken>;
};

/** Rounds away floating-point noise (`0.025 * 16` → `0.4`). */
const round = (n: number, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

/**
 * The variables of the first `@theme default { … }` block, without the
 * leading `--`: `{ 'color-red-500': 'oklch(…)', 'spacing': '0.25rem', … }`.
 * Values spanning several lines are joined with single spaces.
 */
export function parseThemeCss(css: string): Record<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = /@theme default\s*\{([\s\S]*?)\n\}/.exec(withoutComments);
  if (!block) throw new Error('no `@theme default { … }` block found');
  const vars: Record<string, string> = {};
  for (const match of block[1].matchAll(/--([\w-]+)\s*:\s*([^;]*);/g)) {
    vars[match[1]] = match[2].replace(/\s+/g, ' ').trim();
  }
  return vars;
}

/** `name` → value for every `--<namespace>-<name>` variable. */
function namespace(
  vars: Record<string, string>,
  prefix: string,
): [string, string][] {
  return Object.entries(vars)
    .filter(([key]) => key.startsWith(`${prefix}-`))
    .map(([key, value]) => [key.slice(prefix.length + 1), value]);
}

/** `'0.75rem'` → 12, `'4px'` → 4, `'0'` → 0. */
export function toPoints(value: string): number {
  const match = /^(-?\d*\.?\d+)(rem|px)?$/.exec(value.trim());
  if (!match) throw new Error(`unsupported length: ${value}`);
  const n = Number(match[1]);
  return round(match[2] === 'rem' ? n * BASE_FONT_SIZE : n);
}

/** `'-0.025em'` → -0.4 (at the 16px base font size). */
export function emToPoints(value: string): number {
  const match = /^(-?\d*\.?\d+)em$/.exec(value.trim());
  if (!match) throw new Error(`unsupported em value: ${value}`);
  return round(Number(match[1]) * BASE_FONT_SIZE) || 0;
}

/** `'1.5'` → 1.5, `'calc(1.25 / 0.875)'` → 1.4286 (unitless ratio). */
export function toRatio(value: string): number {
  const text = value.trim();
  if (/^\d*\.?\d+$/.test(text)) return Number(text);
  const calc = /^calc\(\s*(\d*\.?\d+)\s*\/\s*(\d*\.?\d+)\s*\)$/.exec(text);
  if (calc) return Number(calc[1]) / Number(calc[2]);
  throw new Error(`unsupported line height: ${text}`);
}

const toSrgb = toGamut('rgb', 'oklch');

/**
 * Any CSS color → hex, since RN has no `oklch()`. Colors outside sRGB are
 * gamut-mapped (CSS Color 4 algorithm) instead of clipped. Translucent colors
 * become 8-digit hex.
 */
export function toHex(css: string): string {
  const parsed = parse(css);
  if (!parsed) throw new Error(`unsupported color: ${css}`);
  const rgb = toSrgb(parsed);
  return (rgb.alpha ?? 1) < 1 ? formatHex8(rgb) : formatHex(rgb);
}

/** `color-red-500` → `'red.500'`; `color-black` → `black`. */
export function convertColors(
  vars: Record<string, string>,
): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const [name, value] of namespace(vars, 'color')) {
    const shade = /^(.+)-(\d+)$/.exec(name);
    colors[shade ? `${shade[1]}.${shade[2]}` : name] = toHex(value);
  }
  return colors;
}

/**
 * One box-shadow → one RN shadow. RN has no multi-layer shadows, so the
 * first layer is used. CSS blur is twice RN's `shadowRadius`.
 */
export function convertShadow(name: string, value: string): ShadowToken {
  // Layers are comma-separated, but `rgb(…)` may contain commas too.
  const [first] = value.split(/,(?![^(]*\))/);
  const match =
    /^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(\S.*)$/.exec(
      first.trim(),
    );
  if (!match) throw new Error(`unsupported box-shadow: ${value}`);
  const color = parse(match[5]);
  if (!color) throw new Error(`unsupported shadow color: ${match[5]}`);
  const elevation = SHADOW_ELEVATIONS[name];
  if (elevation === undefined) {
    throw new Error(`no elevation defined for shadow '${name}'`);
  }
  return {
    shadowColor: formatHex({ ...color, alpha: undefined }),
    shadowOffset: { width: Number(match[1]), height: Number(match[2]) },
    shadowOpacity: round(color.alpha ?? 1),
    // Spread (match[4]) has no RN equivalent and is dropped.
    shadowRadius: round(Number(match[3] ?? 0) / 2),
    elevation,
  };
}

export function convertTheme(css: string): ConvertedTheme {
  const vars = parseThemeCss(css);
  const spacingUnit = toPoints(vars.spacing);

  // `--text-sm` is the size; `--text-sm--line-height` the paired ratio.
  const sizes = namespace(vars, 'text').filter(
    ([name]) => !name.includes('--') && !name.startsWith('shadow'),
  );
  const fontSizes = Object.fromEntries(
    sizes.map(([name, value]) => [name, toPoints(value)]),
  );

  return {
    colors: convertColors(vars),
    spacing: {
      px: 1,
      ...Object.fromEntries(
        SPACING_STEPS.map((n) => [n, round(n * spacingUnit)]),
      ),
    },
    radii: {
      none: UTILITY_RADII.none,
      ...Object.fromEntries(
        namespace(vars, 'radius').map(([name, value]) => [
          name,
          toPoints(value),
        ]),
      ),
      full: UTILITY_RADII.full,
    },
    fontSizes,
    fontWeights: Object.fromEntries(namespace(vars, 'font-weight')),
    lineHeights: {
      ...UTILITY_LINE_HEIGHTS,
      ...Object.fromEntries(
        namespace(vars, 'leading').map(([name, value]) => [
          name,
          toRatio(value),
        ]),
      ),
    },
    letterSpacings: Object.fromEntries(
      namespace(vars, 'tracking').map(([name, value]) => [
        name,
        emToPoints(value),
      ]),
    ),
    shadows: Object.fromEntries(
      namespace(vars, 'shadow').map(([name, value]) => [
        name,
        convertShadow(name, value),
      ]),
    ),
    // `text-sm` sets both, so each size is also a preset with its line height
    // (absolute, since presets are used as-is).
    text: Object.fromEntries(
      sizes.map(([name]) => [
        name,
        {
          fontSize: fontSizes[name],
          lineHeight: round(
            fontSizes[name] * toRatio(vars[`text-${name}--line-height`]),
          ),
        },
      ]),
    ),
  };
}
