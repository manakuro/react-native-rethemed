/**
 * Radix Themes–style sample components (Card, Button, Badge, Callout). Uses
 * this theme's own `useThemed`, so every token below is type-checked against
 * the Radix tokens. Comments show the matching Radix Themes components.
 */
import { Pressable, Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function RadixUiPreview() {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 3 })}>
      {/* <Card size="2"> */}
      <View
        style={themed.view({
          gap: 3,
          padding: 4,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: 'gray.a5',
          backgroundColor: 'color.panel-solid',
          shadow: 2,
        })}
      >
        {/* <Heading size="4"> / <Text size="2" color="gray"> */}
        <Text style={themed.text.heading[4]({ color: 'gray.12' })}>
          Radix Themes tokens
        </Text>
        <Text style={themed.text.text[2]({ color: 'gray.11' })}>
          Accent and gray scales, panel colors, space, radius and type —
          configured like {'<Theme>'}.
        </Text>
        <Buttons />
        <Badges />
      </View>
      <Callouts />
    </View>
  );
}

function Buttons() {
  const { themed } = useThemed();
  const base = themed.view({
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 2,
  });
  const label = (color: 'accent.contrast' | 'accent.a11') =>
    themed.text.text[2]({ color, fontWeight: 'medium' });

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 3 })}
    >
      {/* <Button variant="solid"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          base,
          themed.view({ backgroundColor: pressed ? 'accent.10' : 'accent.9' }),
        ]}
      >
        <Text style={label('accent.contrast')}>Solid</Text>
      </Pressable>
      {/* <Button variant="soft"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          base,
          themed.view({ backgroundColor: pressed ? 'accent.a4' : 'accent.a3' }),
        ]}
      >
        <Text style={label('accent.a11')}>Soft</Text>
      </Pressable>
      {/* <Button variant="outline"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          base,
          themed.view({
            borderWidth: 1,
            borderColor: 'accent.a8',
            backgroundColor: pressed ? 'accent.a2' : undefined,
          }),
        ]}
      >
        <Text style={label('accent.a11')}>Outline</Text>
      </Pressable>
      {/* <Button variant="ghost"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          base,
          themed.view({ backgroundColor: pressed ? 'accent.a3' : undefined }),
        ]}
      >
        <Text style={label('accent.a11')}>Ghost</Text>
      </Pressable>
    </View>
  );
}

const BADGES = [
  { label: 'Accent', bg: 'accent.a3', fg: 'accent.a11' },
  { label: 'Gray', bg: 'gray.a3', fg: 'gray.a11' },
  { label: 'Green', bg: 'green.a3', fg: 'green.a11' },
  { label: 'Red', bg: 'red.a3', fg: 'red.a11' },
] as const;

/** <Badge variant="soft"> */
function Badges() {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
    >
      {BADGES.map(({ label, bg, fg }) => (
        <View
          key={label}
          style={themed.view({
            paddingHorizontal: 2,
            paddingVertical: 1,
            borderRadius: 2,
            backgroundColor: bg,
          })}
        >
          <Text
            style={themed.text.text[1]({ color: fg, fontWeight: 'medium' })}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const CALLOUTS = [
  { scale: 'accent', text: 'You will need admin privileges to install.' },
  { scale: 'green', text: 'Your changes have been saved.' },
  { scale: 'amber', text: 'Your trial ends in 3 days.' },
  { scale: 'red', text: 'Access denied. Please contact the administrator.' },
] as const;

/** <Callout.Root variant="soft" color="…"> */
function Callouts() {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 2 })}>
      {CALLOUTS.map(({ scale, text }) => (
        <View
          key={scale}
          style={themed.view({
            padding: 3,
            borderRadius: 3,
            backgroundColor: `${scale}.a3`,
          })}
        >
          <Text style={themed.text.text[2]({ color: `${scale}.a11` })}>
            {text}
          </Text>
        </View>
      ))}
    </View>
  );
}
