import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as muiColors from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { codegen } from '@react-native-rethemed/cli/src/codegen';
import { validateTheme } from '@react-native-rethemed/cli/src/validate';
import { describe, expect, it } from 'vitest';
import {
  convertShadow,
  convertTheme,
  emToPoints,
  HUES,
  type MuiColors,
  type MuiTheme,
  normalizeColor,
  remToPoints,
  toPoints,
} from '../scripts/convert';
import {
  colors,
  fontWeights,
  materialUiTheme,
  radii,
  semanticColors,
  shadows,
  spacing,
  typography,
  zIndices,
} from './index';

const light = createTheme({ palette: { mode: 'light' } });
const dark = createTheme({ palette: { mode: 'dark' } });

describe('tokens.gen.ts', () => {
  it('matches the installed @mui/material (run `pnpm generate` if not)', () => {
    expect(
      convertTheme(
        light as unknown as MuiTheme,
        dark as unknown as MuiTheme,
        muiColors as unknown as MuiColors,
      ),
    ).toEqual({
      colors,
      semanticColors,
      typography,
      fontWeights,
      spacing,
      radii,
      zIndices,
      shadows,
    });
  });
});

describe('semanticColors', () => {
  it('pairs the light and dark palettes', () => {
    expect(semanticColors.primary.main).toEqual({
      light: light.palette.primary.main,
      dark: dark.palette.primary.main,
    });
    expect(semanticColors.background.paper).toEqual({
      light: '#ffffff',
      dark: '#121212',
    });
    expect(semanticColors.text.secondary.dark).toBe('rgba(255, 255, 255, 0.7)');
    expect(semanticColors.divider.default.light).toBe(light.palette.divider);
  });

  it('has every intent with main / light / dark / contrastText', () => {
    for (const intent of [
      'primary',
      'secondary',
      'error',
      'warning',
      'info',
      'success',
    ] as const) {
      expect(Object.keys(semanticColors[intent])).toEqual([
        'main',
        'light',
        'dark',
        'contrastText',
      ]);
    }
  });
});

describe('colors', () => {
  it('has 14 shades for every hue, plus black and white', () => {
    expect(Object.keys(colors)).toHaveLength(HUES.length * 14 + 2);
    expect(colors['red.500']).toBe(muiColors.red[500]);
    expect(colors['deepPurple.A200']).toBe(muiColors.deepPurple.A200);
    expect(colors.white).toBe('#ffffff');
  });

  it('only contains 6-digit hex values', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('typography', () => {
  it('converts rem, em and unitless line heights to points', () => {
    expect(typography.h1).toEqual({
      fontSize: 96,
      lineHeight: 112.03,
      letterSpacing: -1.5,
      fontWeight: '300',
    });
    expect(typography.body1).toEqual({
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
      fontWeight: '400',
    });
  });

  it('keeps textTransform for button and overline only', () => {
    expect(typography.button.textTransform).toBe('uppercase');
    expect(typography.overline.textTransform).toBe('uppercase');
    expect(typography.body1).not.toHaveProperty('textTransform');
  });
});

describe('scales', () => {
  it('matches theme.spacing() and sx borderRadius multiples', () => {
    expect(spacing[2]).toBe(16);
    expect(spacing[0.5]).toBe(4);
    expect(radii[1]).toBe(light.shape.borderRadius);
    expect(radii[2]).toBe(8);
  });

  it('copies zIndex and font weights', () => {
    expect(zIndices).toEqual(light.zIndex);
    expect(fontWeights).toEqual({
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    });
  });
});

describe('shadows', () => {
  it('has one token per elevation, matching Android elevation', () => {
    expect(Object.keys(shadows)).toHaveLength(25);
    for (const [key, shadow] of Object.entries(shadows)) {
      expect(shadow.elevation).toBe(Number(key));
    }
    expect(shadows[0].shadowOpacity).toBe(0);
  });

  it('uses the first layer and halves the CSS blur', () => {
    expect(
      convertShadow(
        '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14)',
        8,
      ),
    ).toEqual({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 2.5,
      elevation: 8,
    });
  });
});

describe('helpers', () => {
  it('normalizes and parses CSS values', () => {
    expect(normalizeColor('#fff')).toBe('#ffffff');
    expect(normalizeColor('rgba(0, 0, 0, 0.87)')).toBe('rgba(0, 0, 0, 0.87)');
    expect(toPoints('8px')).toBe(8);
    expect(remToPoints('0.875rem', 16)).toBe(14);
    expect(emToPoints('0.02857em', 14)).toBe(0.4);
    expect(emToPoints('0em', 24)).toBe(0);
    expect(() => toPoints('1rem')).toThrow('unsupported length');
  });
});

describe('materialUiTheme', () => {
  it('passes CLI validation', () => {
    expect(validateTheme(materialUiTheme)).toEqual([]);
  });

  it('generates types and docs with the CLI', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'rn-rethemed-mui-'));
    const outFile = path.join(dir, 'themed.gen.ts');
    const docsFile = path.join(dir, 'themed.md');
    const result = await codegen({
      themeFile: path.join(import.meta.dirname, 'index.ts'),
      exportName: 'materialUiTheme',
      outFile,
      docsFile,
    });
    expect(result.counts).toMatchObject({
      colors: 36,
      primitiveColors: 268,
      radii: 7,
      spacing: 15,
      shadows: 25,
      textPresets: 13,
    });
    const docs = readFileSync(docsFile, 'utf8');
    expect(docs).toContain('| `button` | 14 | 24.5 | 0.4 | 500 | uppercase |');
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
