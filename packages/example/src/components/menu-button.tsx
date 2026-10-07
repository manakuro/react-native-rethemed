/** The hamburger button that opens the theme drawer. */
import { Pressable, View } from 'react-native';
import { useThemed } from '../shell/themed.gen';

export function MenuButton({ onPress }: { onPress: () => void }) {
  const { themed } = useThemed();
  const bar = themed.view({
    width: 18,
    height: 2,
    borderRadius: 'full',
    backgroundColor: 'fg.default',
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open theme menu"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) =>
        themed.view({
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          borderRadius: 'md',
          backgroundColor: pressed ? 'bg.subtle' : undefined,
        })
      }
    >
      <View style={bar} />
      <View style={bar} />
      <View style={bar} />
    </Pressable>
  );
}
