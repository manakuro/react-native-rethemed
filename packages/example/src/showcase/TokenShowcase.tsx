/**
 * Renders every token category a theme defines, for any theme.
 *
 * Two `useThemed` instances meet here:
 * - `theme` — the showcased theme (loosely typed, see `ThemeEntry`): only the
 *   token being demonstrated comes from it.
 * - `shell` — the playground's own theme: labels, borders and backgrounds, so
 *   a theme without colors still renders legibly.
 *
 * Categories the theme doesn't define are listed in the summary and skipped.
 */

import {
  isTextPreset,
  type TextTokenTree,
  type UseThemedResult,
} from '@react-native-rethemed/core';
import { Text, type TextStyle, View } from 'react-native';
import { useThemed as useShell } from '../shell/themed.gen';
import type { ThemeEntry } from '../themes';
import { Section, SubLabel, TokenLabel, TokenRow, Wrap } from './layout';

type Theme = UseThemedResult;

/** Spacing keys are numbers when numeric (`4`), strings otherwise (`px`). */
const tokenKey = (name: string) =>
  /^-?\d+(\.\d+)?$/.test(name) ? Number(name) : name;

const isEmpty = (value: object | undefined) =>
  !value || Object.keys(value).length === 0;

const CATEGORIES: { label: string; has: (theme: Theme) => boolean }[] = [
  {
    label: 'Semantic colors',
    has: (t) => !isEmpty(t.semanticTokens.colors),
  },
  { label: 'Primitive colors', has: (t) => !isEmpty(t.tokens.colors) },
  { label: 'Spacing', has: (t) => !isEmpty(t.tokens.spacing) },
  { label: 'Radii', has: (t) => !isEmpty(t.tokens.radii) },
  { label: 'Text presets', has: (t) => !isEmpty(t.semanticTokens.text) },
  { label: 'Font sizes', has: (t) => !isEmpty(t.tokens.fontSizes) },
  { label: 'Font weights', has: (t) => !isEmpty(t.tokens.fontWeights) },
  { label: 'Line heights', has: (t) => !isEmpty(t.tokens.lineHeights) },
  { label: 'Letter spacings', has: (t) => !isEmpty(t.tokens.letterSpacings) },
  { label: 'Shadows', has: (t) => !isEmpty(t.tokens.shadows) },
  { label: 'Z-indices', has: (t) => !isEmpty(t.tokens.zIndices) },
];

export function TokenShowcase({ entry }: { entry: ThemeEntry }) {
  const theme = entry.useThemed();
  const { themed: shell } = useShell();
  const { Preview } = entry;

  return (
    <View style={shell.view({ gap: 8 })}>
      <Summary entry={entry} theme={theme} />
      {Preview ? (
        <Section
          title="Components"
          description="Sample components written against this theme's typed tokens."
        >
          <Preview />
        </Section>
      ) : null}
      <SemanticColors theme={theme} />
      <PrimitiveColors theme={theme} />
      <TextPresets theme={theme} />
      <Spacing theme={theme} />
      <Radii theme={theme} />
      <FontSizes theme={theme} />
      <FontWeights theme={theme} />
      <LineHeights theme={theme} />
      <LetterSpacings theme={theme} />
      <Shadows theme={theme} />
      <ZIndices theme={theme} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function Summary({ entry, theme }: { entry: ThemeEntry; theme: Theme }) {
  const { themed } = useShell();

  return (
    <View
      style={themed.view({
        gap: 3,
        padding: 4,
        borderRadius: 'lg',
        borderWidth: 1,
        borderColor: 'border.default',
        backgroundColor: 'bg.surface',
      })}
    >
      <Text
        style={themed.text({
          color: 'fg.muted',
          fontSize: 'sm',
          lineHeight: 'normal',
        })}
      >
        {entry.description}
      </Text>
      <View
        style={themed.view({
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1.5,
        })}
      >
        {CATEGORIES.map((category) => {
          const has = category.has(theme);
          return (
            <View
              key={category.label}
              style={themed.view({
                paddingHorizontal: 2,
                paddingVertical: 0.5,
                borderRadius: 'full',
                borderWidth: 1,
                borderColor: has ? 'accent.solid' : 'border.default',
                backgroundColor: has ? 'bg.selected' : undefined,
              })}
            >
              <Text
                style={themed.text({
                  color: has ? 'accent.fg' : 'fg.subtle',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  textDecorationLine: has ? 'none' : 'line-through',
                })}
              >
                {category.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

function Swatch({
  theme,
  token,
  value,
}: {
  theme: Theme;
  token: string;
  value: string;
}) {
  const { themed } = useShell();

  return (
    <View style={themed.view({ width: 76, gap: 1 })}>
      <View
        style={[
          themed.view({
            height: 40,
            borderRadius: 'md',
            borderWidth: 1,
            borderColor: 'border.default',
          }),
          theme.themed.view({ backgroundColor: token }),
        ]}
      />
      <Text
        numberOfLines={1}
        style={themed.text({
          color: 'fg.default',
          fontSize: '2xs',
          fontWeight: 'medium',
        })}
      >
        {token}
      </Text>
      <Text style={themed.text({ color: 'fg.subtle', fontSize: '2xs' })}>
        {value}
      </Text>
    </View>
  );
}

/** One row of color strips: `tokens` from left to right. */
function ColorStrip({
  theme,
  label,
  value,
  tokens,
}: {
  theme: Theme;
  label: string;
  value?: string;
  tokens: string[];
}) {
  const { themed } = useShell();

  return (
    <TokenRow>
      <TokenLabel name={label} value={value} />
      <View
        style={themed.view({
          flex: 1,
          flexDirection: 'row',
          overflow: 'hidden',
          borderRadius: 'sm',
        })}
      >
        {tokens.map((token) => (
          <View
            key={token}
            style={[
              themed.view({ flex: 1, height: 24 }),
              theme.themed.view({ backgroundColor: token }),
            ]}
          />
        ))}
      </View>
    </TokenRow>
  );
}

function SemanticColors({ theme }: { theme: Theme }) {
  const { themed: shell } = useShell();
  const colors = theme.semanticTokens.colors;
  if (isEmpty(colors)) return null;

  // Groups sharing the same token names (gray, red, … in Chakra UI) are
  // color palettes and shown as strips; the rest (bg, fg, …) as swatches.
  const groups = Object.keys(colors);
  const signature = (group: string) => Object.keys(colors[group]).join(',');
  const counts = new Map<string, number>();
  for (const group of groups) {
    counts.set(signature(group), (counts.get(signature(group)) ?? 0) + 1);
  }
  const isPalette = (group: string) => (counts.get(signature(group)) ?? 0) >= 3;
  const roles = groups.filter((group) => !isPalette(group));
  const palettes = groups.filter(isPalette);

  return (
    <Section
      title="Semantic colors"
      description="semanticTokens.colors — switch with light/dark. Toggle the appearance in the menu to compare."
    >
      {roles.map((group) => (
        <View key={group} style={shell.view({ gap: 2 })}>
          <SubLabel>{group}</SubLabel>
          <Wrap>
            {Object.keys(colors[group]).map((token) => (
              <Swatch
                key={token}
                theme={theme}
                token={`${group}.${token}`}
                value={colors[group][token]}
              />
            ))}
          </Wrap>
        </View>
      ))}
      {palettes.length > 0 ? (
        <>
          <SubLabel>
            palettes · {Object.keys(colors[palettes[0]]).join(' · ')}
          </SubLabel>
          {palettes.map((palette) => (
            <ColorStrip
              key={palette}
              theme={theme}
              label={palette}
              tokens={Object.keys(colors[palette]).map(
                (token) => `${palette}.${token}`,
              )}
            />
          ))}
        </>
      ) : null}
    </Section>
  );
}

function PrimitiveColors({ theme }: { theme: Theme }) {
  const colors = theme.tokens.colors;
  if (!colors || isEmpty(colors)) return null;

  // `'<hue>.<shade>'` tokens grouped by hue; the rest (white, black, …) alone.
  const hues = new Map<string, string[]>();
  const singles: string[] = [];
  for (const name of Object.keys(colors)) {
    const [hue, shade] = name.split('.');
    if (shade === undefined) {
      singles.push(name);
    } else {
      hues.set(hue, [...(hues.get(hue) ?? []), name]);
    }
  }

  return (
    <Section
      title="Primitive colors"
      description="tokens.colors — fixed, the same in light and dark."
    >
      <Wrap>
        {singles.map((name) => (
          <Swatch key={name} theme={theme} token={name} value={colors[name]} />
        ))}
      </Wrap>
      {[...hues].map(([hue, names]) => (
        <ColorStrip
          key={hue}
          theme={theme}
          label={hue}
          value={`${names.length} shades`}
          tokens={names}
        />
      ))}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/** Every preset path in `semanticTokens.text`, e.g. `['title', 'md']`. */
function presetPaths(tree: TextTokenTree, prefix: string[] = []): string[][] {
  return Object.entries(tree).flatMap(([key, node]) =>
    isTextPreset(node)
      ? [[...prefix, key]]
      : presetPaths(node as TextTokenTree, [...prefix, key]),
  );
}

function TextPresets({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const tree = theme.semanticTokens.text;
  if (!tree || isEmpty(tree)) return null;

  return (
    <Section
      title="Text presets"
      description="semanticTokens.text — themed.text.<path>(override?)."
    >
      {presetPaths(tree).map((path) => {
        // Walk `themed.text.title.md` by path; leaves are callable.
        const preset = path.reduce<unknown>(
          (node, key) => (node as Record<string, unknown>)[key],
          theme.themed.text,
        ) as () => TextStyle;
        const style = preset();
        return (
          <View key={path.join('.')} style={themed.view({ gap: 0.5 })}>
            <Text style={themed.text({ color: 'fg.subtle', fontSize: '2xs' })}>
              {`themed.text.${path.join('.')}()`} · {style.fontSize}/
              {style.lineHeight} · {style.fontWeight}
            </Text>
            <Text
              numberOfLines={1}
              style={[themed.text({ color: 'fg.default' }), style]}
            >
              The quick brown fox
            </Text>
          </View>
        );
      })}
    </Section>
  );
}

function FontSizes({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const fontSizes = theme.tokens.fontSizes;
  if (!fontSizes || isEmpty(fontSizes)) return null;

  return (
    <Section title="Font sizes" description="tokens.fontSizes — fontSize.">
      {Object.keys(fontSizes).map((name) => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={fontSizes[name]} />
          <Text
            numberOfLines={1}
            style={[
              themed.text({ flex: 1, color: 'fg.default' }),
              theme.themed.text({ fontSize: name }),
            ]}
          >
            Aa
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

function FontWeights({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const fontWeights = theme.tokens.fontWeights;
  if (!fontWeights || isEmpty(fontWeights)) return null;

  return (
    <Section
      title="Font weights"
      description="tokens.fontWeights — fontWeight."
    >
      {Object.keys(fontWeights).map((name) => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={String(fontWeights[name])} />
          <Text
            style={[
              themed.text({ flex: 1, color: 'fg.default', fontSize: 'lg' }),
              theme.themed.text({ fontWeight: name }),
            ]}
          >
            The quick brown fox
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

function LineHeights({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const lineHeights = theme.tokens.lineHeights;
  if (!lineHeights || isEmpty(lineHeights)) return null;
  // Line heights are ratios of fontSize; use the theme's own size if it has one.
  const fontSize = theme.tokens.fontSizes?.sm ?? 14;

  return (
    <Section
      title="Line heights"
      description={`tokens.lineHeights — ratios of fontSize. Here fontSize is ${fontSize}.`}
    >
      {Object.keys(lineHeights).map((name) => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={`×${lineHeights[name]}`} />
          <Text
            style={[
              themed.text({
                flex: 1,
                color: 'fg.default',
                backgroundColor: 'bg.subtle',
              }),
              theme.themed.text({ fontSize, lineHeight: name }),
            ]}
          >
            Design tokens keep spacing and type consistent across screens.
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

function LetterSpacings({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const letterSpacings = theme.tokens.letterSpacings;
  if (!letterSpacings || isEmpty(letterSpacings)) return null;

  return (
    <Section
      title="Letter spacings"
      description="tokens.letterSpacings — letterSpacing."
    >
      {Object.keys(letterSpacings).map((name) => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={letterSpacings[name]} />
          <Text
            style={[
              themed.text({
                flex: 1,
                color: 'fg.default',
                fontSize: 'md',
                fontWeight: 'semibold',
              }),
              theme.themed.text({ letterSpacing: name }),
            ]}
          >
            LETTER SPACING
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

function Spacing({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const spacing = theme.tokens.spacing;
  if (!spacing || isEmpty(spacing)) return null;
  const names = Object.keys(spacing)
    .filter((name) => spacing[name] >= 0)
    .sort((a, b) => spacing[a] - spacing[b]);

  return (
    <Section
      title="Spacing"
      description="tokens.spacing — padding*, margin*, gap. Each bar's width is paddingLeft: <token>."
    >
      {names.map((name) => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={spacing[name]} />
          <View style={themed.view({ flex: 1, overflow: 'hidden' })}>
            <View
              style={[
                themed.view({
                  alignSelf: 'flex-start',
                  height: 12,
                  borderRadius: 'sm',
                  backgroundColor: 'accent.solid',
                }),
                theme.themed.view({ paddingLeft: tokenKey(name) }),
              ]}
            />
          </View>
        </TokenRow>
      ))}
    </Section>
  );
}

function Radii({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const radii = theme.tokens.radii;
  if (!radii || isEmpty(radii)) return null;

  return (
    <Section
      title="Radii"
      description="tokens.radii — borderRadius and corners."
    >
      <Wrap>
        {Object.keys(radii).map((name) => (
          <View
            key={name}
            style={themed.view({ alignItems: 'center', gap: 1 })}
          >
            <View
              style={[
                themed.view({
                  width: 64,
                  height: 64,
                  borderWidth: 2,
                  borderColor: 'accent.solid',
                  backgroundColor: 'bg.selected',
                }),
                theme.themed.view({ borderRadius: name }),
              ]}
            />
            <TokenLabel name={name} value={radii[name]} width={64} />
          </View>
        ))}
      </Wrap>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Elevation
// ---------------------------------------------------------------------------

function Shadows({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const shadows = theme.tokens.shadows;
  if (!shadows || isEmpty(shadows)) return null;

  return (
    <Section
      title="Shadows"
      description="tokens.shadows — the virtual shadow prop (expands to shadow* and elevation)."
    >
      <View
        style={themed.view({
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 4,
          padding: 2,
        })}
      >
        {Object.keys(shadows).map((name) => (
          <View
            key={name}
            style={[
              themed.view({
                width: 88,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'lg',
                backgroundColor: 'bg.canvas',
              }),
              theme.themed.view({ shadow: name }),
            ]}
          >
            <Text
              style={themed.text({
                color: 'fg.default',
                fontSize: 'sm',
                fontWeight: 'medium',
              })}
            >
              {name}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function ZIndices({ theme }: { theme: Theme }) {
  const { themed } = useShell();
  const zIndices = theme.tokens.zIndices;
  if (!zIndices || isEmpty(zIndices)) return null;

  // Up to four tokens spread over the scale, rendered highest first: zIndex,
  // not render order, decides which box ends up on top.
  const sorted = Object.keys(zIndices).sort(
    (a, b) => zIndices[a] - zIndices[b],
  );
  const picks = [
    ...new Set(
      [0, 1 / 3, 2 / 3, 1].map(
        (at) => sorted[Math.round(at * (sorted.length - 1))],
      ),
    ),
  ].reverse();

  return (
    <Section
      title="Z-indices"
      description="tokens.zIndices — zIndex. The boxes are rendered highest first, yet stack by token value."
    >
      <View style={{ height: 40 + picks.length * 24 }}>
        {picks.map((name, index) => {
          const depth = picks.length - 1 - index;
          return (
            <View
              key={name}
              style={[
                themed.view({
                  position: 'absolute',
                  width: 140,
                  height: 64,
                  padding: 2,
                  borderRadius: 'md',
                  borderWidth: 1,
                  borderColor: 'accent.solid',
                  backgroundColor: index === 0 ? 'accent.solid' : 'bg.selected',
                  shadow: 'sm',
                }),
                { top: depth * 24, left: depth * 40 },
                theme.themed.view({ zIndex: name }),
              ]}
            >
              <Text
                style={themed.text({
                  color: index === 0 ? 'accent.contrast' : 'accent.fg',
                  fontSize: 'xs',
                  fontWeight: 'semibold',
                })}
              >
                {name} ({zIndices[name]})
              </Text>
            </View>
          );
        })}
      </View>
      <View
        style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
      >
        {sorted.map((name) => (
          <Text
            key={name}
            style={themed.text({ color: 'fg.muted', fontSize: 'xs' })}
          >
            {name} {zIndices[name]}
          </Text>
        ))}
      </View>
    </Section>
  );
}
