/**
 * How the generated `themed.gen.ts` is used in a component. Checked by `tsc`
 * (not run), so it breaks if the generated types stop matching the theme.
 */
import { Pressable, Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function Card() {
  const { themed, semanticTokens } = useThemed();

  // `<Card>`: `bg-card text-card-foreground rounded-xl border py-6 shadow-sm`
  return (
    <View
      style={themed.view({
        backgroundColor: 'card',
        borderColor: 'border',
        borderWidth: 1,
        borderRadius: 'xl',
        padding: 6,
        gap: 4,
        shadow: 'sm',
      })}
    >
      <Text
        style={themed.text.base({
          color: 'card-foreground',
          fontWeight: 'semibold',
        })}
      >
        shadcn/ui tokens
      </Text>
      <Text style={themed.text.sm({ color: 'muted-foreground' })}>
        Semantic colors switch with light and dark mode.
      </Text>
      {/* `<Button>`: `bg-primary text-primary-foreground rounded-md h-9 px-4` */}
      <Pressable
        style={themed.view({
          alignSelf: 'flex-start',
          backgroundColor: 'primary',
          borderRadius: 'md',
          paddingHorizontal: 4,
          paddingVertical: 2,
        })}
      >
        <Text
          style={themed.text.sm({
            color: 'primary-foreground',
            fontWeight: 'medium',
          })}
        >
          Button
        </Text>
      </Pressable>
      {/* Outside `style`, read resolved values from `semanticTokens`. */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: semanticTokens.colors['sidebar-border'],
        }}
      />
    </View>
  );
}

export function rejected() {
  const { themed } = useThemed();
  // @ts-expect-error colors are token-only
  themed.view({ backgroundColor: '#171717' });
  // @ts-expect-error shadcn/ui names, not `primary.foreground`
  themed.text({ color: 'primary.foreground' });
  // @ts-expect-error no `chart-6`
  themed.view({ backgroundColor: 'chart-6' });
}
