/**
 * Chakra UI–specific sample components. Uses this theme's own `useThemed`,
 * so every token below is type-checked against the Chakra UI tokens.
 */
import { Pressable, Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function ChakraUiPreview() {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 3 })}>
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
      <Badges />
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
