import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { codegen } from '@react-native-rethemed/cli/src/codegen';
import { validateTheme } from '@react-native-rethemed/cli/src/validate';
import { extendTheme } from '@react-native-rethemed/core/config';
import { tailwindCssTheme } from '@react-native-rethemed/tailwind-css-tokens';
import { describe, expect, it } from 'vitest';
import {
  BASE_COLORS,
  type BaseColor,
  type CssVars,
  convertRegistry,
  RADIUS_SCALE,
  toHex,
  toPoints,
} from '../scripts/convert';
import { baseColors, radii, semanticColors, shadcnUiTheme } from './index';

const registryDir = path.join(import.meta.dirname, '../scripts/registry');
const registry = Object.fromEntries(
  BASE_COLORS.map((base) => [
    base,
    JSON.parse(
      readFileSync(path.join(registryDir, `${base}.json`), 'utf8'),
    ) as CssVars,
  ]),
) as Record<BaseColor, CssVars>;

describe('tokens.gen.ts', () => {
  it('matches the registry snapshot (run `pnpm generate` if not)', () => {
    expect(convertRegistry(registry)).toEqual({ baseColors, radii });
  });

  it('has every base color with the same 31 color names', () => {
    expect(Object.keys(baseColors)).toEqual([...BASE_COLORS]);
    const names = Object.keys(baseColors.neutral);
    expect(names).toHaveLength(31);
    for (const base of BASE_COLORS) {
      expect(Object.keys(baseColors[base])).toEqual(names);
    }
    expect(names).not.toContain('radius');
  });
});

describe('colors', () => {
  it('converts oklch to hex, keeping translucent borders as 8-digit hex', () => {
    expect(semanticColors.background).toEqual({
      light: '#ffffff',
      dark: '#0a0a0a',
    });
    expect(semanticColors.primary).toEqual({
      light: '#171717',
      dark: '#e5e5e5',
    });
    // `oklch(1 0 0 / 10%)`
    expect(semanticColors.border.dark).toBe('#ffffff1a');
    expect(toHex('oklch(1 0 0 / 15%)')).toBe('#ffffff26');
  });

  it('uses the Tailwind palette the base color is named after', () => {
    // neutral's `primary` is Tailwind's `neutral.900`.
    expect(semanticColors.primary.light).toBe(
      tailwindCssTheme.tokens?.colors?.['neutral.900'],
    );
  });
});

describe('radii', () => {
  it('derives the scale from --radius (0.625rem = 10)', () => {
    expect(toPoints(registry.neutral.light.radius)).toBe(10);
    expect(radii).toEqual({
      sm: 6,
      md: 8,
      lg: 10,
      xl: 14,
      '2xl': 18,
      '3xl': 22,
      '4xl': 26,
    });
    expect(Object.keys(radii)).toEqual(Object.keys(RADIUS_SCALE));
  });
});

describe('shadcnUiTheme', () => {
  it('is tailwindCssTheme with shadcn/ui colors and radii on top', () => {
    expect(shadcnUiTheme.tokens?.spacing).toEqual(
      tailwindCssTheme.tokens?.spacing,
    );
    expect(shadcnUiTheme.tokens?.radii).toEqual({
      ...tailwindCssTheme.tokens?.radii,
      ...radii,
    });
    expect(shadcnUiTheme.semanticTokens?.colors).toEqual(semanticColors);
    expect(shadcnUiTheme.semanticTokens?.text).toEqual(
      tailwindCssTheme.semanticTokens?.text,
    );
  });

  it('switches base colors with extendTheme', () => {
    const zinc = extendTheme(shadcnUiTheme, {
      semanticTokens: { colors: baseColors.zinc },
    });
    expect(zinc.semanticTokens?.colors).toEqual(baseColors.zinc);
  });

  it('passes CLI validation without warnings', async () => {
    expect(validateTheme(shadcnUiTheme)).toEqual([]);
    const result = await codegen({
      themeFile: path.join(import.meta.dirname, 'index.ts'),
      exportName: 'shadcnUiTheme',
      outFile: path.join(
        mkdtempSync(path.join(tmpdir(), 'rn-rethemed-shadcn-')),
        'themed.gen.ts',
      ),
    });
    expect(result.warnings).toEqual([]);
    expect(result.counts).toMatchObject({ colors: 31, radii: 10 });
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
