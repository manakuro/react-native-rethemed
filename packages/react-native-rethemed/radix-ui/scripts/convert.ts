/**
 * Converts Radix Themes' published token CSS (`@radix-ui/themes/tokens/
 * base.css` and `tokens/colors/<scale>.css`) into react-native-rethemed
 * data. Pure functions only: `generate.ts` writes the result to
 * `src/tokens.gen.ts`, and the tests re-run the conversion to check that
 * the committed file still matches the installed `@radix-ui/themes`.
 *
 * The output is raw data (lengths before `--scaling`, radii before
 * `--radius-factor`, colors per scale): `createRadixUiTheme` in
 * `src/theme.ts` combines it the way `<Theme>`'s props do.
 *
 * Not exported from the package.
 */
import { formatHex, formatHex8, interpolate, parse } from 'culori';

/** Every color scale Radix Themes ships (`tokens/colors/<scale>.css`). */
export const SCALES = [
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'bronze',
  'gold',
  'brown',
  'orange',
  'amber',
  'yellow',
  'lime',
  'mint',
  'sky',
] as const;

export type ScaleName = (typeof SCALES)[number];

/** `step` → `{ light, dark }` hex: `1`…`12`, `a1`…`a12`, `contrast`, `surface`, `indicator`, `track`. */
export type Scale = Record<string, { light: string; dark: string }>;

/** A shadow layer, color still unresolved when it is a gray alpha step. */
export type ShadowLayer = {
  x: number;
  y: number;
  blur: number;
  /** A hex color, or `'gray.a3'` — resolved against the theme's gray. */
  color: string;
};

export type ConvertedTokens = {
  scales: Record<ScaleName, Scale>;
  /** `--color-*` per scheme: hex, or `'gray.<step>'` for the theme's gray. */
  backgroundColors: Record<string, { light: string; dark: string }>;
  space: Record<string, number>;
  fontSizes: Record<string, number>;
  lineHeights: Record<string, number>;
  headingLineHeights: Record<string, number>;
  /** em, so the points depend on the font size of the preset. */
  letterSpacings: Record<string, number>;
  headingLetterSpacing: number;
  fontWeights: Record<string, string>;
  radii: Record<string, number>;
  radiusFactors: Record<string, number>;
  radiusFull: Record<string, number>;
  scalings: Record<string, number>;
  /** Light-mode shadows (inset `shadow-1` omitted), one layer each. */
  shadows: Record<string, ShadowLayer>;
};

type Vars = Record<string, string>;

/**
 * The innermost `selector { --a: b; … }` blocks in source order, without
 * Display P3 values (RN renders sRGB). Nested `@supports` / `@media`
 * wrappers are dropped, so a later block overrides an earlier one like the
 * cascade does for modern browsers (`color-mix()` support).
 */
export function parseBlocks(css: string): { selector: string; vars: Vars }[] {
  const blocks: { selector: string; vars: Vars }[] = [];
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of withoutComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const vars: Vars = {};
    for (const [, name, value] of match[2].matchAll(
      /--([\w-]+)\s*:\s*([^;]+);/g,
    )) {
      const clean = value.replace(/\s+/g, ' ').trim();
      if (!clean.includes('display-p3')) vars[name] = clean;
    }
    blocks.push({ selector: match[1].replace(/\s+/g, ' ').trim(), vars });
  }
  return blocks;
}

/** Merges the vars of every block whose selector matches, in order. */
function cascade(
  blocks: { selector: string; vars: Vars }[],
  matches: (selector: string) => boolean,
  base: Vars = {},
): Vars {
  return blocks
    .filter((block) => matches(block.selector))
    .reduce((vars, block) => Object.assign(vars, block.vars), { ...base });
}

const isLight = (selector: string) =>
  /(^|,\s*)(:root|\.light)/.test(selector) && !selector.includes('.dark');
const isDark = (selector: string) => /^\.dark/.test(selector);

/** Rounds away floating-point noise. */
const round = (n: number, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

/** Any CSS color (`white`, `rgba()`, hex) → hex; translucent → 8 digits. */
export function toHex(css: string): string {
  const color = parse(css);
  if (!color) throw new Error(`unsupported color: ${css}`);
  return (color.alpha ?? 1) < 1 ? formatHex8(color) : formatHex(color);
}

/**
 * Resolves a color value within one scheme's variables: `var(--x)`,
 * `color-mix(in oklab, A, B P%)`, or a literal color.
 */
export function resolveColor(value: string, vars: Vars, depth = 0): string {
  if (depth > 10) throw new Error(`circular reference: ${value}`);
  const ref = /^var\(--([\w-]+)\)$/.exec(value);
  if (ref) {
    const target = vars[ref[1]];
    if (target === undefined)
      throw new Error(`undefined variable: --${ref[1]}`);
    return resolveColor(target, vars, depth + 1);
  }
  const mix = /^color-mix\(in oklab,\s*(.+?),\s*(.+?)\s+(\d*\.?\d+)%\)$/.exec(
    value,
  );
  if (mix) {
    const a = parse(resolveColor(mix[1], vars, depth + 1));
    const b = parse(resolveColor(mix[2], vars, depth + 1));
    if (!a || !b) throw new Error(`unsupported color-mix: ${value}`);
    const mixed = interpolate([a, b], 'oklab')(Number(mix[3]) / 100);
    return toHex(formatHex8(mixed));
  }
  return toHex(value);
}

/** `tokens/colors/<scale>.css` → the scale's steps in light and dark. */
export function convertScale(name: ScaleName, css: string): Scale {
  const blocks = parseBlocks(css);
  const light = cascade(blocks, isLight);
  // Dark inherits from `:root` (e.g. `--<scale>-contrast`), then overrides.
  const dark = cascade(blocks, isDark, light);
  const scale: Scale = {};
  for (const key of Object.keys(light)) {
    if (!key.startsWith(`${name}-`)) continue;
    scale[key.slice(name.length + 1)] = {
      light: resolveColor(light[key], light),
      dark: resolveColor(dark[key], dark),
    };
  }
  return scale;
}

/** `'calc(4px * var(--scaling))'` → 4, `'16px'` → 16. */
export function toPixels(value: string): number {
  const match = /^(?:calc\()?(-?\d*\.?\d+)px\b/.exec(value.trim());
  if (!match) throw new Error(`unsupported length: ${value}`);
  return Number(match[1]);
}

/** `'-0.0025em'` → -0.0025. */
export function toEm(value: string): number {
  const match = /^(-?\d*\.?\d+)em$/.exec(value.trim());
  if (!match) throw new Error(`unsupported em value: ${value}`);
  return Number(match[1]);
}

/** `--prefix-<key>` variables as `key → value`. */
function prefixed(vars: Vars, prefix: string): [string, string][] {
  const pattern = new RegExp(`^${prefix}-([\\w-]+)$`);
  return Object.entries(vars).flatMap(([name, value]) => {
    const match = pattern.exec(name);
    return match ? [[match[1], value] as [string, string]] : [];
  });
}

/** Splits on commas outside parentheses (`color-mix(…, …)` stays whole). */
export function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '(') depth += 1;
    else if (value[i] === ')') depth -= 1;
    else if (value[i] === ',' && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

/**
 * The layer that reads as the shadow in RN: `0 0 0 Npx` rings (borders
 * drawn as shadows) are skipped, then the layer with the largest blur wins.
 * CSS blur is twice RN's `shadowRadius`.
 */
export function pickShadowLayer(value: string, vars: Vars): ShadowLayer | null {
  if (value.includes('inset')) return null;
  const layers = splitTopLevel(value)
    .map((layer) => {
      const match =
        /^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+-?[\d.]+(?:px)?)?\s+(.+)$/.exec(
          layer.trim(),
        );
      if (!match) throw new Error(`unsupported box-shadow layer: ${layer}`);
      return {
        x: Number(match[1]),
        y: Number(match[2]),
        blur: Number(match[3]),
        color: match[4],
      };
    })
    .filter((layer) => layer.x !== 0 || layer.y !== 0 || layer.blur !== 0);
  if (layers.length === 0) return null;
  const layer = layers.reduce((a, b) => (b.blur > a.blur ? b : a));
  const gray = /^var\(--gray-(a?\d+)\)$/.exec(layer.color);
  return {
    x: layer.x,
    y: layer.y,
    blur: layer.blur,
    color: gray ? `gray.${gray[1]}` : resolveColor(layer.color, vars),
  };
}

/** A `--color-*` value: hex, or `'gray.<step>'` when it is the theme's gray. */
function backgroundColor(value: string, vars: Vars): string {
  const gray = /^var\(--gray-(a?\d+)\)$/.exec(value);
  return gray ? `gray.${gray[1]}` : resolveColor(value, vars);
}

export function convertTokens(
  baseCss: string,
  scaleCss: Record<ScaleName, string>,
): ConvertedTokens {
  const blocks = parseBlocks(baseCss);
  const root = cascade(blocks, (s) => s === ':root');
  const themes = cascade(blocks, (s) => s === '.radix-themes');
  const lightColors = cascade(
    blocks,
    (s) => s === ':where(.radix-themes)',
    root,
  );
  const darkColors = cascade(blocks, (s) => s.startsWith(':is(.dark'), root);
  const radius = cascade(blocks, (s) => s === '[data-radius]');
  const attribute = (name: string) =>
    Object.fromEntries(
      blocks.flatMap(({ selector, vars }) => {
        const match = new RegExp(`\\[data-${name}='([^']+)'\\]`).exec(selector);
        return match ? [[match[1], vars]] : [];
      }),
    ) as Record<string, Vars>;
  const radiusSettings = attribute('radius');
  const scalingSettings = attribute('scaling');

  const numbers = (prefix: string, vars: Vars = themes) =>
    Object.fromEntries(
      prefixed(vars, prefix).map(([key, value]) => [key, toPixels(value)]),
    );

  return {
    scales: Object.fromEntries(
      SCALES.map((name) => [name, convertScale(name, scaleCss[name])]),
    ) as Record<ScaleName, Scale>,
    backgroundColors: Object.fromEntries(
      prefixed(lightColors, 'color')
        .filter(([key]) => key !== 'transparent' && key !== 'panel')
        .map(([key, value]) => [
          key,
          {
            light: backgroundColor(value, lightColors),
            dark: backgroundColor(darkColors[`color-${key}`], darkColors),
          },
        ]),
    ),
    space: numbers('space'),
    fontSizes: numbers('font-size'),
    lineHeights: numbers('line-height'),
    headingLineHeights: numbers('heading-line-height'),
    letterSpacings: Object.fromEntries(
      prefixed(themes, 'letter-spacing').map(([k, v]) => [k, toEm(v)]),
    ),
    headingLetterSpacing: toEm(themes['heading-letter-spacing']),
    fontWeights: Object.fromEntries(prefixed(themes, 'font-weight')),
    radii: numbers('radius', radius),
    radiusFactors: Object.fromEntries(
      Object.entries(radiusSettings).map(([key, vars]) => [
        key,
        Number(vars['radius-factor']),
      ]),
    ),
    radiusFull: Object.fromEntries(
      Object.entries(radiusSettings).map(([key, vars]) => [
        key,
        toPixels(vars['radius-full']),
      ]),
    ),
    scalings: Object.fromEntries(
      Object.entries(scalingSettings).map(([key, vars]) => [
        key,
        Number(vars.scaling),
      ]),
    ),
    shadows: Object.fromEntries(
      prefixed(lightColors, 'shadow').flatMap(([key, value]) => {
        const layer = pickShadowLayer(value, lightColors);
        return layer ? [[key, { ...layer, blur: round(layer.blur) }]] : [];
      }),
    ),
  };
}
