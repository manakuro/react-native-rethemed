/**
 * A left-side drawer built on React Native's `Modal` + `Animated` (no native
 * dependencies). Opens with a slide-in panel and a fading backdrop; closes on
 * backdrop tap or the Android back button.
 */
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemed } from '../shell/themed.gen';

const MAX_WIDTH = 320;

// `navigationBarTranslucent` is RN 0.77+ (Android). Spread untyped so apps on
// older versions (apps/rn076) type-check; they ignore the prop at runtime.
const EDGE_TO_EDGE_PROPS: object = { navigationBarTranslucent: true };

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function ThemeDrawer({ open, onClose, children }: Props) {
  const { themed } = useThemed();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(MAX_WIDTH, width * 0.85);

  const progress = useRef(new Animated.Value(0)).current;
  // Stay mounted until the close animation finishes.
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 260 : 200,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, progress]);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      {...EDGE_TO_EDGE_PROPS}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          themed.view({ backgroundColor: 'bg.backdrop' }),
          { opacity: progress },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[
          themed.view({
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: panelWidth,
            backgroundColor: 'bg.canvas',
            borderRightWidth: 1,
            borderRightColor: 'border.default',
            shadow: 'lg',
          }),
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-panelWidth, 0],
                }),
              },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}
