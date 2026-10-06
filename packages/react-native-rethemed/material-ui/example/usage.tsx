/**
 * How the generated `themed.gen.ts` is used in a component. Checked by `tsc`
 * (not run), so it breaks if the generated types stop matching the theme.
 */
import { Pressable, Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function Card() {
  const { themed, semanticTokens } = useThemed();

  return (
    <View
      style={themed.view({
        // Like `<Paper elevation={2}>`: `shadow` takes the elevation.
        backgroundColor: 'background.paper',
        borderRadius: 1,
        padding: 2,
        gap: 1,
        shadow: 2,
      })}
    >
      <Text style={themed.text.h6({ color: 'text.primary' })}>
        Material UI tokens
      </Text>
      <Text style={themed.text.body2({ color: 'text.secondary' })}>
        palette, typography, spacing, shape, shadows and zIndex.
      </Text>
      {/* Like `<Button variant="contained">`: `button` is uppercase. */}
      <Pressable
        style={themed.view({
          alignSelf: 'flex-start',
          backgroundColor: 'primary.main',
          borderRadius: 1,
          paddingHorizontal: 2,
          paddingVertical: 0.5,
          shadow: 2,
        })}
      >
        <Text style={themed.text.button({ color: 'primary.contrastText' })}>
          Contained
        </Text>
      </Pressable>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: semanticTokens.colors.divider.default,
        }}
      />
      {/* Primitive colors use Material UI's names. */}
      <View style={themed.view({ backgroundColor: 'deepPurple.A200' })} />
    </View>
  );
}

export function rejected() {
  const { themed } = useThemed();
  // @ts-expect-error colors are token-only
  themed.view({ backgroundColor: '#1976d2' });
  // @ts-expect-error not a palette color
  themed.text({ color: 'primary.contrast' });
  // @ts-expect-error spacing(1.25) is not a token
  themed.view({ padding: 1.25 });
  // @ts-expect-error elevations stop at 24
  themed.view({ shadow: 25 });
  // @ts-expect-error not a typography variant
  themed.text.h7;
}
