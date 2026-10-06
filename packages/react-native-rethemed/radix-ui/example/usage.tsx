/**
 * How the generated `themed.gen.ts` is used in a component. Checked by `tsc`
 * (not run), so it breaks if the generated types stop matching the theme.
 */
import { Pressable, Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function Card() {
  const { themed, semanticTokens } = useThemed();

  // `<Card size="2">`: panel background, radius-4, space-4, shadow
  return (
    <View
      style={themed.view({
        backgroundColor: 'color.panel-solid',
        borderColor: 'gray.a5',
        borderWidth: 1,
        borderRadius: 4,
        padding: 4,
        gap: 3,
        shadow: 3,
      })}
    >
      {/* `<Heading size="4">` */}
      <Text style={themed.text.heading[4]({ color: 'gray.12' })}>
        Radix UI tokens
      </Text>
      {/* `<Text size="2" color="gray">` */}
      <Text style={themed.text.text[2]({ color: 'gray.11' })}>
        Accent and gray scales switch with light and dark mode.
      </Text>
      {/* `<Button variant="solid">` */}
      <Pressable
        style={themed.view({
          alignSelf: 'flex-start',
          backgroundColor: 'accent.9',
          borderRadius: 2,
          paddingHorizontal: 3,
          paddingVertical: 2,
        })}
      >
        <Text
          style={themed.text.text[2]({
            color: 'accent.contrast',
            fontWeight: 'medium',
          })}
        >
          Button
        </Text>
      </Pressable>
      {/* `<Button variant="soft">` */}
      <View style={themed.view({ backgroundColor: 'accent.a3' })} />
      <View style={{ backgroundColor: semanticTokens.colors.color.overlay }} />
    </View>
  );
}

export function rejected() {
  const { themed } = useThemed();
  // @ts-expect-error colors are token-only
  themed.view({ backgroundColor: '#3e63dd' });
  // @ts-expect-error scales outside `colors` are not in the theme
  themed.view({ backgroundColor: 'red.9' });
  // @ts-expect-error steps stop at 12
  themed.view({ backgroundColor: 'accent.13' });
  // @ts-expect-error `shadow-1` is inset and not included
  themed.view({ shadow: 1 });
}
