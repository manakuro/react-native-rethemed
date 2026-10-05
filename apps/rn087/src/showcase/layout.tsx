/** Section / label building blocks, styled with the shell theme. */
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useThemed } from '../shell/themed.gen';

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { themed } = useThemed();

  return (
    <View style={themed.view({ gap: 3 })}>
      <View style={themed.view({ gap: 1 })}>
        <Text
          style={themed.text({
            color: 'fg.default',
            fontSize: 'lg',
            fontWeight: 'semibold',
          })}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={themed.text({
              color: 'fg.muted',
              fontSize: 'sm',
              lineHeight: 'normal',
            })}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function SubLabel({ children }: { children: ReactNode }) {
  const { themed } = useThemed();

  return (
    <Text
      style={themed.text({
        color: 'fg.muted',
        fontSize: 'xs',
        fontWeight: 'semibold',
      })}
    >
      {children}
    </Text>
  );
}

/** `name` and its value, in a fixed-width label column. */
export function TokenLabel({
  name,
  value,
  width = 96,
}: {
  name: string;
  value?: string | number;
  width?: number;
}) {
  const { themed } = useThemed();

  return (
    <View style={{ width }}>
      <Text
        style={themed.text({
          color: 'fg.default',
          fontSize: 'xs',
          fontWeight: 'medium',
        })}
      >
        {name}
      </Text>
      {value !== undefined && value !== '' ? (
        <Text style={themed.text({ color: 'fg.subtle', fontSize: '2xs' })}>
          {value}
        </Text>
      ) : null}
    </View>
  );
}

export function TokenRow({ children }: { children: ReactNode }) {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      })}
    >
      {children}
    </View>
  );
}

export function Wrap({ children }: { children: ReactNode }) {
  const { themed } = useThemed();

  return (
    <View
      style={themed.view({ flexDirection: 'row', flexWrap: 'wrap', gap: 3 })}
    >
      {children}
    </View>
  );
}
