/**
 * react-native-rethemed playground with the Chakra UI theme.
 *
 * Styles come from `useThemed()` (generated in `src/theme/themed.gen.ts`).
 * After changing `src/theme/theme.ts`, run `pnpm theme:codegen`.
 *
 * @format
 */

import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { ColorMode } from '@react-native-rethemed/core';
import {
  ThemedProvider,
  useColorMode,
  useThemed,
} from './src/theme/themed.gen';

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
      <ScrollView contentContainerStyle={themed.view({ padding: 4, gap: 6 })}>
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
        <Card />
        <Badges />
      </ScrollView>
    </SafeAreaView>
  );
}

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

export default App;
