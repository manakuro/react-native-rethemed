/**
 * How the generated `themed.gen.ts` is used in a component. Checked by `tsc`
 * (not run), so it breaks if the generated types stop matching the theme.
 */
import { Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function Card() {
  const { themed } = useThemed();

  // Reads like the class names: `bg-white border border-gray-200 p-6
  // rounded-xl shadow-md`.
  return (
    <View
      style={themed.view({
        backgroundColor: 'white',
        borderColor: 'gray.200',
        borderWidth: 1,
        padding: 6,
        gap: 2,
        borderRadius: 'xl',
        shadow: 'md',
      })}
    >
      {/* `text-xl font-semibold tracking-tight text-gray-900` */}
      <Text
        style={themed.text.xl({
          color: 'gray.900',
          fontWeight: 'semibold',
          letterSpacing: 'tight',
        })}
      >
        Tailwind CSS tokens
      </Text>
      {/* `text-sm text-gray-500`: size and its line height together. */}
      <Text style={themed.text.sm({ color: 'gray.500' })}>
        Colors, spacing, radii, shadows and type from theme.css.
      </Text>
      {/* `text-base leading-relaxed`: a size with another line height. */}
      <Text
        style={themed.text({
          color: 'gray.700',
          fontSize: 'base',
          lineHeight: 'relaxed',
        })}
      >
        fontSize alone, with a leading-* ratio.
      </Text>
      <View
        style={themed.view({
          alignSelf: 'flex-start',
          backgroundColor: 'sky.500',
          paddingHorizontal: 3,
          paddingVertical: 1.5,
          borderRadius: 'full',
        })}
      >
        <Text style={themed.text.xs({ color: 'white', fontWeight: 'medium' })}>
          Badge
        </Text>
      </View>
    </View>
  );
}

export function rejected() {
  const { themed } = useThemed();
  // @ts-expect-error colors are token-only
  themed.view({ backgroundColor: '#0ea5e9' });
  // @ts-expect-error `p-13` works in Tailwind v4, but is not a listed step
  themed.view({ padding: 13 });
  // @ts-expect-error Tailwind calls it `base`, not `md`
  themed.text({ fontSize: 'md' });
  // @ts-expect-error inset shadows are not part of the theme
  themed.view({ shadow: 'inner' });
  // @ts-expect-error no `text-10xl`
  themed.text['10xl'];
}
