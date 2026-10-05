/**
 * react-native-rethemed playground.
 *
 * - The hamburger menu opens a drawer listing the themes in `src/themes`;
 *   picking one shows all of its tokens.
 * - The playground's own chrome uses a separate, neutral theme
 *   (`src/shell`), so each showcased theme is shown exactly as its package
 *   ships it.
 * - The shell's ThemedProvider owns the color mode; the showcased theme's
 *   provider is controlled by it, so both always agree on light/dark.
 *
 * After changing any `theme.ts`, run `pnpm theme:codegen`.
 *
 * @format
 */

import { useState } from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MenuButton } from './src/components/MenuButton';
import { ThemeDrawer } from './src/components/ThemeDrawer';
import { ThemeMenu } from './src/components/ThemeMenu';
import { ThemedProvider, useThemed } from './src/shell/themed.gen';
import { TokenShowcase } from './src/showcase/TokenShowcase';
import { THEMES, type ThemeEntry } from './src/themes';

function App() {
  return (
    <SafeAreaProvider>
      {/* Uncontrolled: follows the OS until the user picks a mode. */}
      <ThemedProvider>
        <Playground />
      </ThemedProvider>
    </SafeAreaProvider>
  );
}

function Playground() {
  const { themed, colorScheme } = useThemed();
  const [theme, setTheme] = useState<ThemeEntry>(THEMES[0]);
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
          onSelect={next => {
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

export default App;
