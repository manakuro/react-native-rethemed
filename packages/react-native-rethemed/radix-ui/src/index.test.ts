import { mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getMatchingGrayColor as radixMatchingGray } from '@radix-ui/themes/helpers';
import { themePropDefs } from '@radix-ui/themes/props';
import { codegen } from '@react-native-rethemed/cli/src/codegen';
import { validateTheme } from '@react-native-rethemed/cli/src/validate';
import { describe, expect, it } from 'vitest';
import {
  convertTokens,
  parseBlocks,
  resolveColor,
  SCALES,
  type ScaleName,
  splitTopLevel,
} from '../scripts/convert';
import {
  type AccentColor,
  createRadixUiTheme,
  getMatchingGrayColor,
  radixUiTheme,
  scales,
} from './index';
import * as tokens from './tokens.gen';

const require = createRequire(import.meta.url);
const read = (file: string) =>
  readFileSync(require.resolve(`@radix-ui/themes/${file}`), 'utf8');

const colorsOf = (config: ReturnType<typeof createRadixUiTheme>) =>
  config.semanticTokens?.colors as Record<
    string,
    Record<string, { light: string; dark: string }>
  >;

describe('tokens.gen.ts', () => {
  it('matches the installed @radix-ui/themes (run `pnpm generate` if not)', () => {
    const { headingLetterSpacing, ...tables } = convertTokens(
      read('tokens/base.css'),
      Object.fromEntries(
        SCALES.map((name) => [name, read(`tokens/colors/${name}.css`)]),
      ) as Record<ScaleName, string>,
    );
    expect(headingLetterSpacing).toBe(tokens.headingLetterSpacing);
    expect(tables).toEqual({
      scales: tokens.scales,
      backgroundColors: tokens.backgroundColors,
      space: tokens.space,
      fontSizes: tokens.fontSizes,
      lineHeights: tokens.lineHeights,
      headingLineHeights: tokens.headingLineHeights,
      letterSpacings: tokens.letterSpacings,
      fontWeights: tokens.fontWeights,
      radii: tokens.radii,
      radiusFactors: tokens.radiusFactors,
      radiusFull: tokens.radiusFull,
      scalings: tokens.scalings,
      shadows: tokens.shadows,
    });
  });

  it('has 12 steps, 12 alpha steps and 4 extras for every scale', () => {
    for (const name of SCALES) {
      expect(Object.keys(scales[name]).sort()).toEqual(
        [
          ...Array.from({ length: 12 }, (_, i) => [`${i + 1}`, `a${i + 1}`]),
          ['contrast', 'surface', 'indicator', 'track'],
        ]
          .flat()
          .sort(),
      );
    }
    expect(scales.indigo[9]).toEqual({ light: '#3e63dd', dark: '#3e63dd' });
    expect(scales.amber.contrast).toEqual({
      light: '#21201c',
      dark: '#21201c',
    });
  });

  it('evaluates color-mix() and var() like a modern browser', () => {
    // Dark amber's track is color-mix(in oklab, amber-8, amber-9 75%).
    expect(scales.amber.track.light).toBe(scales.amber[9].light);
    expect(scales.amber.track.dark).not.toBe(scales.amber[9].dark);
    expect(
      resolveColor('color-mix(in oklab, var(--a), var(--b) 100%)', {
        a: '#000000',
        b: '#ffffff',
      }),
    ).toBe('#ffffff');
    expect(
      splitTopLevel('0 0 0 1px color-mix(in oklab, a, b 25%), 0 1px x'),
    ).toHaveLength(2);
  });

  it('drops Display P3 values', () => {
    const blocks = parseBlocks(
      ':root { --x-1: #ffffff; } @supports (x) { :root { --x-1: color(display-p3 1 1 1); } }',
    );
    expect(blocks.map((b) => b.vars)).toEqual([{ 'x-1': '#ffffff' }, {}]);
  });
});

describe('getMatchingGrayColor', () => {
  it('matches Radix Themes for every accent color', () => {
    const accents = themePropDefs.accentColor.values as readonly AccentColor[];
    expect(accents).toHaveLength(26);
    for (const accent of accents) {
      expect(getMatchingGrayColor(accent)).toBe(radixMatchingGray(accent));
    }
  });
});

describe('createRadixUiTheme', () => {
  it('defaults to indigo / slate / medium / 100%', () => {
    const colors = colorsOf(radixUiTheme);
    expect(colors.accent).toEqual(scales.indigo);
    expect(colors.gray).toEqual(scales.slate);
    expect(colors.color.background).toEqual({
      light: '#ffffff',
      dark: scales.slate[1].dark,
    });
    expect(radixUiTheme.tokens?.spacing?.[3]).toBe(12);
    expect(radixUiTheme.tokens?.radii).toEqual({
      1: 3,
      2: 4,
      3: 6,
      4: 8,
      5: 12,
      6: 16,
      full: 0,
    });
    expect(Object.keys(colors)).toEqual(['accent', 'gray', 'color']);
  });

  it('applies grayColor, radius, scaling and extra colors', () => {
    const theme = createRadixUiTheme({
      accentColor: 'crimson',
      radius: 'full',
      scaling: '90%',
      colors: ['green', 'red'],
    });
    const colors = colorsOf(theme);
    expect(colors.gray).toEqual(scales.mauve);
    expect(colors.green).toEqual(scales.green);
    expect(theme.tokens?.spacing?.[3]).toBe(10.8);
    expect(theme.tokens?.radii?.[4]).toBe(10.8);
    expect(theme.tokens?.radii?.full).toBe(9999);
    expect(colorsOf(createRadixUiTheme({ grayColor: 'sand' })).gray).toEqual(
      scales.sand,
    );
  });

  it('builds Text and Heading presets per size', () => {
    const text = radixUiTheme.semanticTokens?.text as Record<
      string,
      Record<string, object>
    >;
    expect(text.text[3]).toEqual({
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    });
    expect(text.text[9]).toEqual({
      fontSize: 60,
      lineHeight: 60,
      letterSpacing: -1.5,
    });
    expect(text.heading[3]).toEqual({
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: 0,
      fontWeight: 'bold',
    });
  });

  it('resolves shadow colors against the theme gray (shadow-1 is inset)', () => {
    const shadows = radixUiTheme.tokens?.shadows ?? {};
    expect(Object.keys(shadows)).toEqual(['2', '3', '4', '5', '6']);
    // shadow-6 keeps a gray-a2 layer: slate's light a2, split into color + opacity.
    expect(shadows[6].shadowColor).toBe(scales.slate.a2.light.slice(0, 7));
    expect(shadows[6].shadowOpacity).toBeGreaterThan(0);
    expect(shadows[5]).toMatchObject({
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 30,
      elevation: 12,
    });
  });

  it('passes CLI validation and generates types', async () => {
    expect(validateTheme(radixUiTheme)).toEqual([]);
    const result = await codegen({
      themeFile: path.join(import.meta.dirname, 'index.ts'),
      exportName: 'radixUiTheme',
      outFile: path.join(
        mkdtempSync(path.join(tmpdir(), 'rn-rethemed-radix-')),
        'themed.gen.ts',
      ),
    });
    expect(result.warnings).toEqual([]);
    expect(result.counts).toMatchObject({
      colors: 61,
      radii: 7,
      spacing: 9,
      shadows: 5,
      textPresets: 18,
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
