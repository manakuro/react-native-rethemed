import { describe, expect, it } from 'vitest';
import { createThemedStyles } from './create-themed-styles';
import { defineTheme } from './define-theme';
import { extendTheme } from './extend-theme';
import { resolveSemanticColors } from './resolvers/color-resolver';
import { isSchemeColor, walkSemanticColors } from './semantic-colors';

const config = defineTheme({
  tokens: { colors: { white: '#ffffff' } },
  semanticTokens: {
    colors: {
      // shadcn/ui style: top-level colors with bare names
      primary: { light: '#171717', dark: '#e5e5e5' },
      'primary-foreground': { light: '#fafafa', dark: '#171717' },
      // grouped, including tokens named `light` / `dark` (Material UI)
      fg: { default: { light: '#111111', dark: '#fafafa' } },
      accent: {
        light: { light: '#42a5f5', dark: '#e3f2fd' },
        dark: { light: '#1565c0', dark: '#42a5f5' },
      },
    },
  },
});

describe('isSchemeColor', () => {
  it('tells a color from a group', () => {
    expect(isSchemeColor({ light: '#000', dark: '#fff' })).toBe(true);
    expect(isSchemeColor({ light: '#000' })).toBe(true);
    expect(isSchemeColor({ default: { light: '#000', dark: '#fff' } })).toBe(
      false,
    );
    expect(isSchemeColor({ light: { light: '#000', dark: '#fff' } })).toBe(
      false,
    );
    expect(isSchemeColor('#000')).toBe(false);
  });
});

describe('walkSemanticColors', () => {
  it('names top-level colors bare and grouped ones group.token', () => {
    const tokens: [string, string | undefined][] = [];
    walkSemanticColors(config.semanticTokens?.colors, (token, _, group) => {
      tokens.push([token, group]);
    });
    expect(tokens).toEqual([
      ['primary', undefined],
      ['primary-foreground', undefined],
      ['fg.default', 'fg'],
      ['accent.light', 'accent'],
      ['accent.dark', 'accent'],
    ]);
  });
});

describe('top-level semantic colors', () => {
  it('resolve in color props by their bare name, per scheme', () => {
    const light = createThemedStyles(config, 'light');
    const dark = createThemedStyles(config, 'dark');
    expect(light.view({ backgroundColor: 'primary' })).toEqual({
      backgroundColor: '#171717',
    });
    expect(dark.text({ color: 'primary-foreground' })).toEqual({
      color: '#171717',
    });
    expect(dark.view({ borderColor: 'accent.light' })).toEqual({
      borderColor: '#e3f2fd',
    });
  });

  it('keep their shape in useThemed().semanticTokens.colors', () => {
    expect(resolveSemanticColors(config, 'dark')).toEqual({
      primary: '#e5e5e5',
      'primary-foreground': '#171717',
      fg: { default: '#fafafa' },
      accent: { light: '#e3f2fd', dark: '#42a5f5' },
    });
  });

  it('are replaced whole by extendTheme, while groups still merge', () => {
    const merged = extendTheme(config, {
      semanticTokens: {
        colors: {
          primary: { light: '#2563eb', dark: '#60a5fa' },
          fg: { muted: { light: '#666666', dark: '#aaaaaa' } },
        },
      },
    });
    expect(merged.semanticTokens?.colors).toMatchObject({
      primary: { light: '#2563eb', dark: '#60a5fa' },
      'primary-foreground': { light: '#fafafa', dark: '#171717' },
      fg: {
        default: { light: '#111111', dark: '#fafafa' },
        muted: { light: '#666666', dark: '#aaaaaa' },
      },
    });
  });

  it('let a later color replace a group and vice versa', () => {
    const merged = extendTheme(config, {
      semanticTokens: {
        colors: {
          fg: { light: '#000000', dark: '#ffffff' },
          primary: { solid: { light: '#2563eb', dark: '#60a5fa' } },
        },
      },
    });
    expect(merged.semanticTokens?.colors?.fg).toEqual({
      light: '#000000',
      dark: '#ffffff',
    });
    expect(merged.semanticTokens?.colors?.primary).toEqual({
      solid: { light: '#2563eb', dark: '#60a5fa' },
    });
  });
});
