import React from 'react';
import { Pressable, StyleProp, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../../theme';
import { messagingSpacing, useMessagingPalette } from '../theme';

type SearchBarProps = {
  containerStyle?: StyleProp<ViewStyle>;
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
};

const AnimatedView = Animated.createAnimatedComponent(View);

function SearchBarComponent({
  containerStyle,
  value,
  onBlur,
  onChangeText,
  onFocus,
  placeholder = 'Rechercher une conversation',
}: SearchBarProps) {
  const palette = useMessagingPalette();
  const focusProgress = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [palette.border, palette.focusRing]
    ),
    shadowOpacity: interpolate(focusProgress.value, [0, 1], [0.08, 0.18]),
    transform: [{ scale: interpolate(focusProgress.value, [0, 1], [1, 1.01]) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusProgress.value, [0, 1], [0.72, 1]),
    transform: [{ scale: interpolate(focusProgress.value, [0, 1], [1, 1.04]) }],
  }));

  const handleFocus = React.useCallback(() => {
    focusProgress.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
    onFocus?.();
  }, [focusProgress, onFocus]);

  const handleBlur = React.useCallback(() => {
    focusProgress.value = withTiming(0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
    onBlur?.();
  }, [focusProgress, onBlur]);

  return (
    <AnimatedView
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
        animatedContainerStyle,
        containerStyle,
      ]}
    >
      <Animated.View style={iconStyle}>
        <Ionicons name="search" size={20} color={palette.textMuted} />
      </Animated.View>

      <TextInput
        value={value}
        onBlur={handleBlur}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        placeholder={placeholder}
        placeholderTextColor={palette.textSoft}
        returnKeyType="search"
        selectionColor={palette.activeStart}
        style={[styles.input, { color: palette.text }]}
      />

      {value ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={[
            styles.clearButton,
            {
              backgroundColor: palette.surfaceMuted,
            },
          ]}
        >
          <Ionicons name="close" size={14} color={palette.textMuted} />
        </Pressable>
      ) : null}
    </AnimatedView>
  );
}

export default React.memo(SearchBarComponent);

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    borderRadius: theme.radii.round,
    borderWidth: 1,
    paddingLeft: theme.spacing.md,
    paddingRight: messagingSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 11,
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
