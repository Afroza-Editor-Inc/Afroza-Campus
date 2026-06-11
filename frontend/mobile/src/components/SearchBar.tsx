import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  value?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export function SearchBar({
  placeholder = 'Rechercher...',
  onChangeText,
  onFocus,
  onBlur,
  value = '',
  showFilter = true,
  onFilterPress,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    hapticFeedback.light();
    setIsFocused(true);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    onBlur?.();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.wrapper}>
        {/* Search Icon */}
        <Ionicons
          name="search"
          size={18}
          color={isFocused ? theme.colors.primary : theme.colors.textMuted}
          style={styles.searchIcon}
        />

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />

        {/* Clear Button */}
        {value.length > 0 && (
          <Pressable
            onPress={() => {
              onChangeText?.('');
              hapticFeedback.light();
            }}
            style={styles.clearButton}
            android_ripple={{ color: theme.colors.text, radius: 16 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Button */}
      {showFilter && (
        <Pressable
          onPress={() => {
            hapticFeedback.light();
            onFilterPress?.();
          }}
          style={({ pressed }) => [
            styles.filterButton,
            pressed && styles.filterButtonPressed,
          ]}
          android_ripple={{ color: theme.colors.primary, radius: 20 }}
        >
          <Ionicons name="funnel" size={20} color={theme.colors.primary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  filterButtonPressed: {
    backgroundColor: theme.colors.primary,
  },
});
