import { Platform, Text, View } from 'react-native';
import { createThemedStyles } from '@react-native-rethemed/core';
import { isSchemeColor } from '@react-native-rethemed/core/config';
import { chakraUiTheme } from '@react-native-rethemed/chakra-ui-tokens';
import { materialDesignTheme } from '@react-native-rethemed/material-design-tokens';
import { materialUiTheme } from '@react-native-rethemed/material-ui-tokens';
import { pandaCssTheme } from '@react-native-rethemed/panda-css-tokens';
import { createRadixUiTheme } from '@react-native-rethemed/radix-ui-tokens';
import { shadcnUiTheme } from '@react-native-rethemed/shadcn-ui-tokens';
import { ThemedProvider, useThemed } from './themed.gen';

/** Every token package's theme, so the bundle includes all of them. */
export const THEMES = [
  chakraUiTheme,
  materialDesignTheme,
  materialUiTheme,
  pandaCssTheme,
  createRadixUiTheme({ accentColor: 'crimson', colors: ['green'] }),
  shadcnUiTheme,
];

function Card() {
  const { themed, semanticTokens } = useThemed();
  return (
    <View
      style={themed.view({
        backgroundColor: 'bg.default',
        padding: Platform.select({ ios: 4, default: 3 }),
        borderRadius: 'lg',
        shadow: 'sm',
      })}
    >
      <Text style={themed.text.lg({ color: 'fg.default', fontWeight: 'semibold' })}>
        Hello from {THEMES.length} themes
      </Text>
      <Text style={{ color: semanticTokens.colors.fg.default }}>
        {isSchemeColor({ light: '#fff' }) ? 'scheme colors' : 'broken'}
      </Text>
    </View>
  );
}

export function App() {
  return (
    <ThemedProvider>
      <Card />
    </ThemedProvider>
  );
}

// Referenced so the bundle keeps it (and the type check covers it).
export const unused = createThemedStyles;
