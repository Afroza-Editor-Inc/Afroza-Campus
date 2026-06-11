import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme';

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function AppScreen({
  children,
  scrollable,
  contentContainerStyle,
  padded = true,
}: ScreenProps) {
  const content = (
    <View
      style={[
        styles.screenContent,
        padded && styles.screenPadding,
        contentContainerStyle,
      ]}
    >
      <View style={styles.topGlow} />
      <View style={styles.sideGlow} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {scrollable ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  icon?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {icon ? <Text style={styles.buttonIcon}>{icon}</Text> : null}
      <Text
        style={[
          styles.buttonLabel,
          variant === 'secondary' && styles.buttonLabelSecondary,
          variant === 'ghost' && styles.buttonLabelGhost,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type InputProps = TextInputProps & {
  label: string;
  hint?: string;
  prefix?: string;
};

export function AppInput({ label, hint, prefix, style, ...props }: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={theme.colors.textSoft}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {hint ? <Text style={styles.inputHint}>{hint}</Text> : null}
    </View>
  );
}

export function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionRow}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Pill({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export function StatChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function LogoBadge({
  source,
  size = 56,
}: {
  source: ImageSourcePropType;
  size?: number;
}) {
  return (
    <View style={[styles.logoBadge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={source}
        resizeMode="contain"
        style={{ width: size * 0.72, height: size * 0.72 }}
      />
    </View>
  );
}

export function AppIcon({
  name,
  size = 20,
  color = theme.colors.text,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function SkeletonBlock({
  width = '100%',
  height = 16,
  radius = 12,
}: {
  width?: ViewStyle['width'];
  height?: number;
  radius?: number;
}) {
  return <View style={[styles.skeleton, { width, height, borderRadius: radius }]} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screenContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenPadding: {
    paddingHorizontal: theme.spacing.lg,
  },
  topGlow: {
    position: 'absolute',
    top: -90,
    left: 30,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(47, 203, 127, 0.15)',
  },
  sideGlow: {
    position: 'absolute',
    top: 80,
    right: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(15, 95, 211, 0.1)',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  button: {
    minHeight: 56,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.glow,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonLabelSecondary: {
    color: theme.colors.text,
  },
  buttonLabelGhost: {
    color: theme.colors.primary,
  },
  buttonIcon: {
    fontSize: 16,
    color: theme.colors.white,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    ...theme.typography.label,
  },
  inputShell: {
    minHeight: 56,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPrefix: {
    color: theme.colors.textSoft,
    fontSize: 15,
    fontWeight: '700',
    marginRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  inputHint: {
    ...theme.typography.caption,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    ...theme.typography.title2,
  },
  sectionAction: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  pillLabelActive: {
    color: theme.colors.white,
  },
  statChip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...theme.typography.title3,
    color: theme.colors.primaryDeep,
  },
  statLabel: {
    ...theme.typography.caption,
  },
  logoBadge: {
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    ...theme.shadows.glow,
  },
  skeleton: {
    backgroundColor: theme.colors.surfaceStrong,
  },
});
