/**
 * react-native-rethemed playground, shared by every app in `apps/`.
 *
 * - The hamburger menu opens a drawer listing the themes in `src/themes`;
 *   picking one shows all of its tokens.
 * - The playground's own chrome uses a separate, neutral theme
 *   (`src/shell`), so each showcased theme is shown exactly as its package
 *   ships it.
 * - The shell's ThemedProvider owns the color mode; the showcased theme's
 *   provider is controlled by it, so both always agree on light/dark.
 */

import type { ThemedProviderProps } from '@react-native-rethemed/core';
import { useState } from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MenuButton } from './components/MenuButton';
import { ThemeDrawer } from './components/ThemeDrawer';
import { ThemeMenu } from './components/ThemeMenu';
import { ThemedProvider, useThemed } from './shell/themed.gen';
import { TokenShowcase } from './showcase/TokenShowcase';
import { THEMES, type ThemeEntry } from './themes';

export type PlaygroundProps = Pick<
  ThemedProviderProps,
  'colorScheme' | 'defaultColorMode' | 'storage' | 'storageKey'
> & {
  /** `id` of the theme shown first (default: the first in `THEMES`). */
  initialThemeId?: string;
};

/**
 * The whole playground screen. Color mode props go to the shell's
 * `ThemedProvider`: leave them out to follow the OS, pass `storage` to
 * persist the user's choice, or `colorScheme` to control it.
 */
export function Playground({ initialThemeId, ...colorMode }: PlaygroundProps) {
  return (
    <SafeAreaProvider>
      <ThemedProvider {...colorMode}>
        <PlaygroundScreen initialThemeId={initialThemeId} />
      </ThemedProvider>
    </SafeAreaProvider>
  );
}

function PlaygroundScreen({ initialThemeId }: { initialThemeId?: string }) {
  const { themed, colorScheme } = useThemed();
  const [theme, setTheme] = useState<ThemeEntry>(
    () => THEMES.find((entry) => entry.id === initialThemeId) ?? THEMES[0],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const SelectedThemeProvider = theme.ThemedProvider;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={themed.view({ flex: 1, backgroundColor: 'bg.canvas' })}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Header theme={theme} onOpenMenu={() => setMenuOpen(true)} />

      {/* Remount per theme: each one has its own provider and hooks. */}
      <SelectedThemeProvider key={theme.id} colorScheme={colorScheme}>
        <ScrollView
          contentContainerStyle={themed.view({ padding: 4, paddingBottom: 10 })}
        >
          <TokenShowcase entry={theme} />
        </ScrollView>
      </SelectedThemeProvider>

      <ThemeDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <ThemeMenu
          selectedId={theme.id}
          onSelect={(next) => {
            setTheme(next);
            setMenuOpen(false);
          }}
        />
      </ThemeDrawer>
    </SafeAreaView>
  );
}

function Header({
  theme,
  onOpenMenu,
}: {
  theme: ThemeEntry;
  onOpenMenu: () => void;
}) {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 2,
        paddingVertical: 2,
        borderBottomWidth: 1,
        borderBottomColor: 'border.default',
        backgroundColor: 'bg.canvas',
      })}
    >
      <MenuButton onPress={onOpenMenu} />
      <View style={themed.view({ flex: 1 })}>
        <Text
          numberOfLines={1}
          style={themed.text({
            color: 'fg.default',
            fontSize: 'lg',
            fontWeight: 'bold',
            lineHeight: 'tight',
          })}
        >
          {theme.name}
        </Text>
        <Text
          numberOfLines={1}
          style={themed.text({ color: 'fg.subtle', fontSize: 'xs' })}
        >
          {theme.packageName}
        </Text>
      </View>
    </View>
  );
}
