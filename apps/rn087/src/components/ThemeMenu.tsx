/** Drawer contents: the theme list and the color mode switch. */
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useThemed } from '../shell/themed.gen';
import { THEMES, type ThemeEntry } from '../themes';
import { ColorModeSwitch } from './ColorModeSwitch';

type Props = {
  selectedId: string;
  onSelect: (theme: ThemeEntry) => void;
};

export function ThemeMenu({ selectedId, onSelect }: Props) {
  const { themed } = useThemed();

  return (
    <ScrollView contentContainerStyle={themed.view({ padding: 4, gap: 6 })}>
      <View style={themed.view({ gap: 0.5 })}>
        <Text
          style={themed.text({
            color: 'fg.default',
            fontSize: 'lg',
            fontWeight: 'bold',
          })}
        >
          react-native-rethemed
        </Text>
        <Text style={themed.text({ color: 'fg.muted', fontSize: 'sm' })}>
          Pick a theme to explore its tokens.
        </Text>
      </View>

      <View style={themed.view({ gap: 2 })}>
        <MenuLabel>Themes</MenuLabel>
        <View style={themed.view({ gap: 1 })}>
          {THEMES.map(theme => (
            <ThemeItem
              key={theme.id}
              theme={theme}
              selected={theme.id === selectedId}
              onPress={() => onSelect(theme)}
            />
          ))}
        </View>
      </View>

      <View style={themed.view({ gap: 2 })}>
        <MenuLabel>Appearance</MenuLabel>
        <ColorModeSwitch />
      </View>
    </ScrollView>
  );
}

function MenuLabel({ children }: { children: string }) {
  const { themed } = useThemed();

  return (
    <Text
      style={themed.text({
        color: 'fg.subtle',
        fontSize: 'xs',
        fontWeight: 'semibold',
        letterSpacing: 0.5,
      })}
    >
      {children.toUpperCase()}
    </Text>
  );
}

function ThemeItem({
  theme,
  selected,
  onPress,
}: {
  theme: ThemeEntry;
  selected: boolean;
  onPress: () => void;
}) {
  const { themed } = useThemed();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) =>
        themed.view({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          paddingHorizontal: 3,
          paddingVertical: 2.5,
          borderRadius: 'md',
          backgroundColor: selected
            ? 'bg.selected'
            : pressed
            ? 'bg.subtle'
            : undefined,
        })
      }
    >
      <View
        style={themed.view({
          width: 4,
          alignSelf: 'stretch',
          borderRadius: 'full',
          backgroundColor: selected ? 'accent.solid' : 'border.default',
        })}
      />
      <View style={themed.view({ flex: 1, gap: 0.5 })}>
        <Text
          style={themed.text({
            color: selected ? 'accent.fg' : 'fg.default',
            fontSize: 'md',
            fontWeight: 'semibold',
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
    </Pressable>
  );
}
