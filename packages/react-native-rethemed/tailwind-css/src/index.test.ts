import { mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { codegen } from '@react-native-rethemed/cli/src/codegen';
import { validateTheme } from '@react-native-rethemed/cli/src/validate';
import { colors as pandaColors } from '@react-native-rethemed/panda-css-tokens';
import { describe, expect, it } from 'vitest';
import {
  convertShadow,
  convertTheme,
  EXCLUDED_NAMESPACES,
  emToPoints,
  parseThemeCss,
  SPACING_STEPS,
  toHex,
  toPoints,
  toRatio,
} from '../scripts/convert';
import {
  colors,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  spacing,
  tailwindCssTheme,
  text,
} from './index';

const require = createRequire(import.meta.url);
const themeCss = readFileSync(
  path.resolve(path.dirname(require.resolve('tailwindcss')), '../theme.css'),
  'utf8',
);

describe('tokens.gen.ts', () => {
  it('matches the installed tailwindcss (run `pnpm generate` if not)', () => {
    expect(convertTheme(themeCss)).toEqual({
      colors,
      spacing,
      radii,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacings,
      shadows,
      text,
    });
  });

  it('covers every theme namespace except the excluded ones', () => {
    const converted = [
      'color',
      'spacing',
      'radius',
      'text',
      'font-weight',
      'leading',
      'tracking',
      'shadow',
    ];
    const known = [...converted, ...EXCLUDED_NAMESPACES].sort(
      (a, b) => b.length - a.length,
    );
    const unknown = Object.keys(parseThemeCss(themeCss)).filter(
      (name) => !known.some((ns) => name === ns || name.startsWith(`${ns}-`)),
    );
    expect(unknown).toEqual([]);
  });
});

describe('colors', () => {
  it('converts oklch to hex, 11 shades for every hue', () => {
    expect(colors['red.500']).toBe('#fb2c36');
    expect(colors['sky.500']).toBe('#00a6f4');
    expect(colors.black).toBe('#000000');
    expect(colors.white).toBe('#ffffff');
    const hues = new Set(
      Object.keys(colors)
        .filter((k) => k.includes('.'))
        .map((k) => k.split('.')[0]),
    );
    expect(Object.keys(colors)).toHaveLength(hues.size * 11 + 2);
  });

  it('is the same palette as the Panda CSS package (Panda uses Tailwind’s)', () => {
    for (const [name, value] of Object.entries(colors)) {
      expect(pandaColors[name as keyof typeof pandaColors]).toBe(value);
    }
  });
});

describe('scales', () => {
  it('uses Tailwind names and values', () => {
    expect(spacing[4]).toBe(16);
    expect(spacing.px).toBe(1);
    expect(Object.keys(spacing)).toHaveLength(SPACING_STEPS.length + 1);
    expect(fontSizes.base).toBe(16);
    expect(radii.none).toBe(0);
    expect(radii.full).toBe(9999);
    expect(lineHeights.none).toBe(1);
    expect(lineHeights.snug).toBe(1.375);
    expect(letterSpacings.tight).toBe(-0.4);
    expect(fontWeights.semibold).toBe('600');
  });

  it('pairs each text size with its line height', () => {
    expect(text.xs).toEqual({ fontSize: 12, lineHeight: 16 });
    expect(text.sm).toEqual({ fontSize: 14, lineHeight: 20 });
    expect(text.base).toEqual({ fontSize: 16, lineHeight: 24 });
    expect(text['9xl']).toEqual({ fontSize: 128, lineHeight: 128 });
    expect(Object.keys(text)).toEqual(Object.keys(fontSizes));
  });
});

describe('shadows', () => {
  it('uses the first layer and halves the CSS blur', () => {
    expect(shadows.md).toEqual({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 4,
    });
    expect(convertShadow('2xs', '0 1px rgb(0 0 0 / 0.05)')).toMatchObject({
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 0,
    });
  });
});

describe('helpers', () => {
  it('parses lengths, ratios and colors', () => {
    expect(toPoints('0.25rem')).toBe(4);
    expect(toPoints('1px')).toBe(1);
    expect(emToPoints('-0.025em')).toBe(-0.4);
    expect(emToPoints('0em')).toBe(0);
    expect(toRatio('calc(1.25 / 0.875)')).toBeCloseTo(1.4286, 4);
    expect(toRatio('1')).toBe(1);
    expect(toHex('oklch(70% 0.4 150)')).toMatch(/^#[0-9a-f]{6}$/);
    expect(() => toPoints('60ch')).toThrow('unsupported length');
  });

  it('joins multi-line values and skips comments', () => {
    expect(
      parseThemeCss(
        '@theme default {\n  /* a */\n  --font-sans:\n    a, b;\n  --spacing: 1px;\n}\n',
      ),
    ).toEqual({ 'font-sans': 'a, b', spacing: '1px' });
  });
});

describe('tailwindCssTheme', () => {
  it('passes CLI validation', () => {
    expect(validateTheme(tailwindCssTheme)).toEqual([]);
  });

  it('generates types and docs with the CLI', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'rn-rethemed-tailwind-'));
    const result = await codegen({
      themeFile: path.join(import.meta.dirname, 'index.ts'),
      exportName: 'tailwindCssTheme',
      outFile: path.join(dir, 'themed.gen.ts'),
      docsFile: path.join(dir, 'themed.md'),
    });
    expect(result.counts).toMatchObject({
      colors: 0,
      primitiveColors: 288,
      radii: 10,
      spacing: 35,
      shadows: 7,
      textPresets: 13,
    });
  });

  it('has an up-to-date example (run `pnpm example:codegen` if not)', async () => {
    const example = path.join(import.meta.dirname, '../example');
    const result = await codegen({
      themeFile: path.join(example, 'theme.ts'),
      exportName: 'themeConfig',
      docsFile: path.join(example, 'themed.md'),
    });
    expect(result.warnings).toEqual([]);
    expect(result.changed).toBe(false);
    expect(result.docs?.changed).toBe(false);
  });
});
