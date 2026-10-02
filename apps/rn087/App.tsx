/**
 * react-native-rethemed playground with the Chakra UI theme.
 *
 * Styles come from `useThemed()` (generated in `src/theme/themed.gen.ts`).
 * After changing `src/theme/theme.ts`, run `pnpm theme:codegen`.
 *
 * Each token section below lists every token of its category straight from
 * `useThemed().tokens` / `semanticTokens`, so it follows theme changes.
 *
 * @format
 */

import type { ReactNode } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { ColorMode } from '@react-native-rethemed/core';
import {
  type ColorToken,
  type FontSizeToken,
  type FontWeightToken,
  type LetterSpacingToken,
  type LineHeightToken,
  type RadiusToken,
  type ShadowToken,
  type SpacingToken,
  ThemedProvider,
  type ZIndexToken,
  useColorMode,
  useThemed,
} from './src/theme/themed.gen';

/** `Object.keys` typed as the object's own keys. */
const keysOf = <T extends object>(object: T) =>
  Object.keys(object) as Extract<keyof T, string>[];

function App() {
  return (
    <SafeAreaProvider>
      {/* Uncontrolled: follows the OS until the user picks a mode. */}
      <ThemedProvider>
        <AppContent />
      </ThemedProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { themed, colorScheme } = useThemed();

  return (
    <SafeAreaView
      style={themed.view({ flex: 1, backgroundColor: 'bg.default' })}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView contentContainerStyle={themed.view({ padding: 4, gap: 8 })}>
        <View style={themed.view({ gap: 1 })}>
          <Text
            style={themed.text({
              color: 'fg.default',
              fontSize: '2xl',
              fontWeight: 'bold',
              lineHeight: 'shorter',
            })}
          >
            react-native-rethemed
          </Text>
          <Text style={themed.text({ color: 'fg.muted', fontSize: 'sm' })}>
            Chakra UI theme · {colorScheme} mode
          </Text>
        </View>

        <ColorModeSwitch />

        <Section title="Components">
          <Card />
          <Badges />
        </Section>

        <SemanticColors />
        <PrimitiveColors />
        <Spacing />
        <Radii />
        <FontSizes />
        <FontWeights />
        <LineHeights />
        <LetterSpacings />
        <Shadows />
        <ZIndices />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 3 })}>
      <View style={themed.view({ gap: 1 })}>
        <Text
          style={themed.text({
            color: 'fg.default',
            fontSize: 'lg',
            fontWeight: 'semibold',
          })}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={themed.text({
              color: 'fg.muted',
              fontSize: 'sm',
              lineHeight: 'moderate',
            })}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** `name` and its value, in a fixed-width label column. */
function TokenLabel({ name, value }: { name: string; value: string | number }) {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ width: 96 })}>
      <Text
        style={themed.text({
          color: 'fg.default',
          fontSize: 'xs',
          fontWeight: 'medium',
        })}
      >
        {name}
      </Text>
      <Text style={themed.text({ color: 'fg.subtle', fontSize: '2xs' })}>
        {value}
      </Text>
    </View>
  );
}

function TokenRow({ children }: { children: ReactNode }) {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      })}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Color mode
// ---------------------------------------------------------------------------

const COLOR_MODES: ColorMode[] = ['system', 'light', 'dark'];

function ColorModeSwitch() {
  const { themed } = useThemed();
  const { mode, setMode } = useColorMode();

  return (
    <View
      style={themed.view({
        flexDirection: 'row',
        padding: 1,
        gap: 1,
        borderRadius: 'lg',
        backgroundColor: 'bg.muted',
      })}
    >
      {COLOR_MODES.map(item => {
        const selected = item === mode;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => setMode(item)}
            style={themed.view({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 2,
              borderRadius: 'md',
              backgroundColor: selected ? 'bg.panel' : 'bg.muted',
              shadow: selected ? 'xs' : undefined,
            })}
          >
            <Text
              style={themed.text({
                color: selected ? 'fg.default' : 'fg.muted',
                fontSize: 'sm',
                fontWeight: 'medium',
              })}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function Card() {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({
        gap: 3,
        padding: 5,
        borderRadius: 'xl',
        borderWidth: 1,
        borderColor: 'border.default',
        backgroundColor: 'bg.panel',
        shadow: 'md',
      })}
    >
      <Text
        style={themed.text({
          color: 'fg.default',
          fontSize: 'lg',
          fontWeight: 'semibold',
        })}
      >
        Design tokens in style props
      </Text>
      <Text
        style={themed.text({
          color: 'fg.muted',
          fontSize: 'md',
          lineHeight: 'moderate',
        })}
      >
        Colors, spacing, radii, shadows and typography come from the theme.
        Semantic colors switch with light and dark mode.
      </Text>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) =>
          themed.view({
            alignSelf: 'flex-start',
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 'md',
            backgroundColor: pressed ? 'blue.emphasized' : 'blue.solid',
          })
        }
      >
        <Text
          style={themed.text({
            color: 'blue.contrast',
            fontSize: 'sm',
            fontWeight: 'semibold',
          })}
        >
          Get started
        </Text>
      </Pressable>
    </View>
  );
}

const STATUSES = [
  { label: 'Success', bg: 'bg.success', fg: 'fg.success' },
  { label: 'Info', bg: 'bg.info', fg: 'fg.info' },
  { label: 'Warning', bg: 'bg.warning', fg: 'fg.warning' },
  { label: 'Error', bg: 'bg.error', fg: 'fg.error' },
] as const;

function Badges() {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
    >
      {STATUSES.map(status => (
        <View
          key={status.label}
          style={themed.view({
            paddingHorizontal: 2.5,
            paddingVertical: 1,
            borderRadius: 'full',
            backgroundColor: status.bg,
          })}
        >
          <Text
            style={themed.text({
              color: status.fg,
              fontSize: 'xs',
              fontWeight: 'medium',
            })}
          >
            {status.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

function Swatch({ token, value }: { token: ColorToken; value: string }) {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ width: 76, gap: 1 })}>
      <View
        style={themed.view({
          height: 40,
          borderRadius: 'md',
          borderWidth: 1,
          borderColor: 'border.muted',
          backgroundColor: token,
        })}
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

function SemanticColors() {
  const { themed, semanticTokens } = useThemed();
  const colors = semanticTokens.colors as Record<
    string,
    Record<string, string>
  >;
  const groups = keysOf(colors);
  // Color palettes (gray, red, …) share the same tokens; roles (bg, fg, …)
  // have their own.
  const roles = groups.filter(group => !('solid' in colors[group]));
  const palettes = groups.filter(group => 'solid' in colors[group]);

  return (
    <Section
      title="Semantic colors"
      description="semanticTokens.colors — switch with light/dark. Toggle the color mode above to compare."
    >
      {roles.map(group => (
        <View key={group} style={themed.view({ gap: 2 })}>
          <Text
            style={themed.text({
              color: 'fg.muted',
              fontSize: 'xs',
              fontWeight: 'semibold',
            })}
          >
            {group}
          </Text>
          <View
            style={themed.view({
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
            })}
          >
            {keysOf(colors[group]).map(token => (
              <Swatch
                key={token}
                token={`${group}.${token}` as ColorToken}
                value={colors[group][token]}
              />
            ))}
          </View>
        </View>
      ))}

      <Text
        style={themed.text({
          color: 'fg.muted',
          fontSize: 'xs',
          fontWeight: 'semibold',
        })}
      >
        palettes
      </Text>
      {palettes.map(palette => (
        <TokenRow key={palette}>
          <TokenLabel name={palette} value="" />
          <View style={themed.view({ flex: 1, flexDirection: 'row', gap: 1 })}>
            {keysOf(colors[palette]).map(token => (
              <View
                key={token}
                style={themed.view({
                  flex: 1,
                  height: 24,
                  borderRadius: 'sm',
                  backgroundColor: `${palette}.${token}` as ColorToken,
                })}
              />
            ))}
          </View>
        </TokenRow>
      ))}
      <Text style={themed.text({ color: 'fg.subtle', fontSize: '2xs' })}>
        {keysOf(colors[palettes[0]] ?? {}).join(' · ')}
      </Text>
    </Section>
  );
}

function PrimitiveColors() {
  const { themed, tokens } = useThemed();
  const names = keysOf(tokens.colors);
  // `'<hue>.<shade>'` tokens grouped by hue; the rest (white, black, …) alone.
  const hues = new Map<string, string[]>();
  const singles: string[] = [];
  for (const name of names) {
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
      <View
        style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
      >
        {singles.map(name => (
          <Swatch
            key={name}
            token={name as ColorToken}
            value={tokens.colors[name as keyof typeof tokens.colors]}
          />
        ))}
      </View>
      {[...hues].map(([hue, shades]) => (
        <TokenRow key={hue}>
          <TokenLabel name={hue} value={`${shades.length} shades`} />
          <View style={themed.view({ flex: 1, flexDirection: 'row' })}>
            {shades.map(name => (
              <View
                key={name}
                style={themed.view({
                  flex: 1,
                  height: 24,
                  backgroundColor: name as ColorToken,
                })}
              />
            ))}
          </View>
        </TokenRow>
      ))}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

function Spacing() {
  const { themed, tokens } = useThemed();
  const spacing = tokens.spacing as Record<string, number>;
  const names = keysOf(spacing).sort((a, b) => spacing[a] - spacing[b]);

  return (
    <Section
      title="Spacing"
      description="tokens.spacing — padding*, margin*, gap. Each bar's width is paddingLeft: <token>."
    >
      {names.map(name => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={spacing[name]} />
          <View style={themed.view({ flex: 1, overflow: 'hidden' })}>
            <View
              style={themed.view({
                alignSelf: 'flex-start',
                height: 12,
                borderRadius: 'xs',
                backgroundColor: 'blue.solid',
                paddingLeft: (name === 'px'
                  ? 'px'
                  : Number(name)) as SpacingToken,
              })}
            />
          </View>
        </TokenRow>
      ))}
    </Section>
  );
}

function Radii() {
  const { themed, tokens } = useThemed();

  return (
    <Section
      title="Radii"
      description="tokens.radii — borderRadius and corners."
    >
      <View
        style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 3 })}
      >
        {keysOf(tokens.radii).map(name => (
          <View
            key={name}
            style={themed.view({ alignItems: 'center', gap: 1 })}
          >
            <View
              style={themed.view({
                width: 64,
                height: 64,
                borderWidth: 2,
                borderColor: 'blue.border',
                backgroundColor: 'blue.subtle',
                borderRadius: name as RadiusToken,
              })}
            />
            <TokenLabel name={name} value={tokens.radii[name]} />
          </View>
        ))}
      </View>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

function FontSizes() {
  const { themed, tokens } = useThemed();

  return (
    <Section title="Font sizes" description="tokens.fontSizes — fontSize.">
      {keysOf(tokens.fontSizes).map(name => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={tokens.fontSizes[name]} />
          <Text
            numberOfLines={1}
            style={themed.text({
              flex: 1,
              color: 'fg.default',
              fontSize: name as FontSizeToken,
            })}
          >
            Aa
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

function FontWeights() {
  const { themed, tokens } = useThemed();

  return (
    <Section
      title="Font weights"
      description="tokens.fontWeights — fontWeight."
    >
      {keysOf(tokens.fontWeights).map(name => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={tokens.fontWeights[name]} />
          <Text
            style={themed.text({
              flex: 1,
              color: 'fg.default',
              fontSize: 'lg',
              fontWeight: name as FontWeightToken,
            })}
          >
            The quick brown fox
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

function LineHeights() {
  const { themed, tokens } = useThemed();

  return (
    <Section
      title="Line heights"
      description="tokens.lineHeights — ratios of fontSize. Here fontSize is sm (14)."
    >
      {keysOf(tokens.lineHeights).map(name => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={`×${tokens.lineHeights[name]}`} />
          <Text
            style={themed.text({
              flex: 1,
              color: 'fg.default',
              backgroundColor: 'bg.muted',
              fontSize: 'sm',
              lineHeight: name as LineHeightToken,
            })}
          >
            Design tokens keep spacing and type consistent across screens.
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

function LetterSpacings() {
  const { themed, tokens } = useThemed();

  return (
    <Section
      title="Letter spacings"
      description="tokens.letterSpacings — letterSpacing."
    >
      {keysOf(tokens.letterSpacings).map(name => (
        <TokenRow key={name}>
          <TokenLabel name={name} value={tokens.letterSpacings[name]} />
          <Text
            style={themed.text({
              flex: 1,
              color: 'fg.default',
              fontSize: 'md',
              fontWeight: 'semibold',
              letterSpacing: name as LetterSpacingToken,
            })}
          >
            LETTER SPACING
          </Text>
        </TokenRow>
      ))}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Elevation
// ---------------------------------------------------------------------------

function Shadows() {
  const { themed, tokens } = useThemed();

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
        {keysOf(tokens.shadows).map(name => (
          <View
            key={name}
            style={themed.view({
              width: 88,
              height: 64,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'lg',
              backgroundColor: 'bg.panel',
              shadow: name as ShadowToken,
            })}
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

/** Rendered in this order; zIndex puts later boxes underneath. */
const STACK: { token: ZIndexToken; color: ColorToken }[] = [
  { token: 'tooltip', color: 'blue.solid' },
  { token: 'modal', color: 'teal.solid' },
  { token: 'dropdown', color: 'purple.solid' },
  { token: 'base', color: 'orange.solid' },
];

function ZIndices() {
  const { themed, tokens } = useThemed();

  return (
    <Section
      title="Z-indices"
      description="tokens.zIndices — zIndex. The boxes are rendered tooltip first, yet stack by token value."
    >
      <View style={themed.view({ height: 140 })}>
        {STACK.map(({ token, color }, index) => (
          <View
            key={token}
            style={themed.view({
              position: 'absolute',
              top: (STACK.length - 1 - index) * 24,
              left: (STACK.length - 1 - index) * 40,
              width: 120,
              height: 64,
              padding: 2,
              borderRadius: 'md',
              backgroundColor: color,
              shadow: 'sm',
              zIndex: token,
            })}
          >
            <Text
              style={themed.text({
                color: 'white',
                fontSize: 'xs',
                fontWeight: 'semibold',
              })}
            >
              {token} ({tokens.zIndices[token]})
            </Text>
          </View>
        ))}
      </View>
      <View
        style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
      >
        {keysOf(tokens.zIndices).map(name => (
          <Text
            key={name}
            style={themed.text({ color: 'fg.muted', fontSize: 'xs' })}
          >
            {name} {tokens.zIndices[name]}
          </Text>
        ))}
      </View>
    </Section>
  );
}

export default App;
