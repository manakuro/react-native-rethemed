/** system / light / dark segmented control for the playground. */
import { Pressable, Text, View } from 'react-native';
import type { ColorMode } from '@react-native-rethemed/core';
import { useColorMode, useThemed } from '../shell/themed.gen';

const COLOR_MODES: ColorMode[] = ['system', 'light', 'dark'];

export function ColorModeSwitch() {
  const { themed } = useThemed();
  const { mode, setMode } = useColorMode();

  return (
    <View
      style={themed.view({
        flexDirection: 'row',
        padding: 1,
        gap: 1,
        borderRadius: 'lg',
        backgroundColor: 'bg.subtle',
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
              backgroundColor: selected ? 'bg.canvas' : undefined,
              shadow: selected ? 'sm' : undefined,
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
