/**
 * Material UI–style sample components (Paper, Button, Alert). Uses this
 * theme's own `useThemed`, so every token below is type-checked against the
 * Material UI tokens.
 */
import { Pressable, Text, View } from 'react-native';
import { useThemed } from './themed.gen';

export function MaterialUiPreview() {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 2 })}>
      {/* <Paper elevation={2}> */}
      <View
        style={themed.view({
          gap: 1.5,
          padding: 2,
          borderRadius: 1,
          backgroundColor: 'background.paper',
          shadow: 2,
        })}
      >
        <Text style={themed.text.h6({ color: 'text.primary' })}>
          Material UI tokens
        </Text>
        <Text style={themed.text.body2({ color: 'text.secondary' })}>
          The default palette, typography variants, spacing, shape and
          elevations from createTheme(), switching with light and dark mode.
        </Text>
        <Buttons />
      </View>
      <Alerts />
    </View>
  );
}

function Buttons() {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 1 })}
    >
      {/* <Button variant="contained"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) =>
          themed.view({
            paddingHorizontal: 2,
            paddingVertical: 1,
            borderRadius: 1,
            backgroundColor: pressed ? 'primary.dark' : 'primary.main',
            shadow: pressed ? 8 : 2,
          })
        }
      >
        <Text style={themed.text.button({ color: 'primary.contrastText' })}>
          Contained
        </Text>
      </Pressable>
      {/* <Button variant="outlined"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) =>
          themed.view({
            paddingHorizontal: 2,
            paddingVertical: 1,
            borderRadius: 1,
            borderWidth: 1,
            borderColor: 'primary.main',
            backgroundColor: pressed ? 'action.hover' : undefined,
          })
        }
      >
        <Text style={themed.text.button({ color: 'primary.main' })}>
          Outlined
        </Text>
      </Pressable>
      {/* <Button variant="text"> */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) =>
          themed.view({
            paddingHorizontal: 1,
            paddingVertical: 1,
            borderRadius: 1,
            backgroundColor: pressed ? 'action.hover' : undefined,
          })
        }
      >
        <Text style={themed.text.button({ color: 'primary.main' })}>Text</Text>
      </Pressable>
    </View>
  );
}

const SEVERITIES = [
  { id: 'success', label: 'This is a success alert.' },
  { id: 'info', label: 'This is an info alert.' },
  { id: 'warning', label: 'This is a warning alert.' },
  { id: 'error', label: 'This is an error alert.' },
] as const;

/** <Alert variant="filled" severity="…"> */
function Alerts() {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 1 })}>
      {SEVERITIES.map(({ id, label }) => (
        <View
          key={id}
          style={themed.view({
            paddingHorizontal: 2,
            paddingVertical: 1.5,
            borderRadius: 1,
            backgroundColor: `${id}.main`,
          })}
        >
          <Text style={themed.text.body2({ color: `${id}.contrastText` })}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
