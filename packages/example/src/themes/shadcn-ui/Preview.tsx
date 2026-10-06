/**
 * shadcn/ui–style sample components (Card, Button, Badge, Input). Uses this
 * theme's own `useThemed`, so every token below is type-checked against the
 * shadcn/ui tokens. Comments show the matching shadcn/ui class names.
 */
import { Pressable, Text, TextInput, View } from 'react-native';
import { useThemed } from './themed.gen';

export function ShadcnUiPreview() {
  const { themed, semanticTokens } = useThemed();

  return (
    // <Card>: bg-card text-card-foreground rounded-xl border py-6 shadow-sm
    <View
      style={themed.view({
        gap: 4,
        padding: 6,
        borderRadius: 'xl',
        borderWidth: 1,
        borderColor: 'border',
        backgroundColor: 'card',
        shadow: 'sm',
      })}
    >
      <View style={themed.view({ gap: 1.5 })}>
        {/* <CardTitle>: leading-none font-semibold */}
        <Text
          style={themed.text({
            color: 'card-foreground',
            fontWeight: 'semibold',
            lineHeight: 'none',
          })}
        >
          Create project
        </Text>
        {/* <CardDescription>: text-muted-foreground text-sm */}
        <Text style={themed.text.sm({ color: 'muted-foreground' })}>
          Deploy your new project in one-click.
        </Text>
      </View>
      {/* <Input>: border-input h-9 rounded-md border px-3 text-base */}
      <TextInput
        placeholder="Name of your project"
        placeholderTextColor={semanticTokens.colors['muted-foreground']}
        style={themed.text({
          height: 36,
          paddingHorizontal: 3,
          borderRadius: 'md',
          borderWidth: 1,
          borderColor: 'input',
          color: 'foreground',
          fontSize: 'sm',
        })}
      />
      <Buttons />
      <Badges />
    </View>
  );
}

const BUTTONS = [
  { label: 'Button', bg: 'primary', fg: 'primary-foreground' },
  { label: 'Secondary', bg: 'secondary', fg: 'secondary-foreground' },
  { label: 'Destructive', bg: 'destructive', fg: 'white' },
] as const;

function Buttons() {
  const { themed } = useThemed();
  const button = themed.view({
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 'md',
  });

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
    >
      {/* <Button variant="default" | "secondary" | "destructive"> */}
      {BUTTONS.map(({ label, bg, fg }) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          style={({ pressed }) => [
            button,
            themed.view({ backgroundColor: bg, opacity: pressed ? 0.9 : 1 }),
          ]}
        >
          <Text style={themed.text.sm({ color: fg, fontWeight: 'medium' })}>
            {label}
          </Text>
        </Pressable>
      ))}
      {/* <Button variant="outline">: border bg-background hover:bg-accent */}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          button,
          themed.view({
            borderWidth: 1,
            borderColor: 'border',
            backgroundColor: pressed ? 'accent' : 'background',
            shadow: 'xs',
          }),
        ]}
      >
        <Text
          style={themed.text.sm({ color: 'foreground', fontWeight: 'medium' })}
        >
          Outline
        </Text>
      </Pressable>
    </View>
  );
}

const BADGES = [
  {
    label: 'Badge',
    bg: 'primary',
    fg: 'primary-foreground',
    border: 'primary',
  },
  {
    label: 'Secondary',
    bg: 'secondary',
    fg: 'secondary-foreground',
    border: 'secondary',
  },
  { label: 'Outline', bg: 'background', fg: 'foreground', border: 'border' },
  {
    label: 'Destructive',
    bg: 'destructive',
    fg: 'white',
    border: 'destructive',
  },
] as const;

/** <Badge>: rounded-md border px-2 py-0.5 text-xs font-medium */
function Badges() {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 2 })}
    >
      {BADGES.map(({ label, bg, fg, border }) => (
        <View
          key={label}
          style={themed.view({
            paddingHorizontal: 2,
            paddingVertical: 0.5,
            borderRadius: 'md',
            borderWidth: 1,
            borderColor: border,
            backgroundColor: bg,
          })}
        >
          <Text style={themed.text.xs({ color: fg, fontWeight: 'medium' })}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
