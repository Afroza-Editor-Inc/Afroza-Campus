import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

export function AuthBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Retour"
      hitSlop={theme.accessibility.hitSlop}
      onPress={onPress}
      style={styles.backButton}
    >
      <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
    </Pressable>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.headingWrap}>
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
    </View>
  );
}

type AuthFieldProps = TextInputProps & {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  secureToggle?: boolean;
};

export function AuthField({ icon, secureToggle, secureTextEntry, ...props }: AuthFieldProps) {
  const [hidden, setHidden] = React.useState(true);
  const isSecure = secureToggle ? hidden : secureTextEntry;

  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        secureTextEntry={isSecure}
        {...props}
      />
      {secureToggle ? (
        <Pressable hitSlop={theme.accessibility.hitSlop} onPress={() => setHidden((value) => !value)}>
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export function AuthCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={theme.accessibility.hitSlop}
      onPress={onToggle}
      style={styles.checkboxRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons name="checkmark" size={14} color={theme.colors.white} /> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export function AuthDivider({ label = 'ou continuer avec' }: { label?: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function AuthSocialRow({ onPress }: { onPress: () => void }) {
  const providers: Array<{
    key: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
  }> = [
    { key: 'facebook', icon: 'logo-facebook', color: '#1877F2' },
    { key: 'google', icon: 'logo-google', color: '#DB4437' },
    { key: 'apple', icon: 'logo-apple', color: theme.colors.textStrong },
  ];

  return (
    <View style={styles.socialRow}>
      {providers.map((provider) => (
        <Pressable
          key={provider.key}
          accessibilityRole="button"
          accessibilityLabel={`Continuer avec ${provider.key}`}
          onPress={onPress}
          style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}
        >
          <Ionicons name={provider.icon} size={24} color={provider.color} />
        </Pressable>
      ))}
    </View>
  );
}

export function AuthFooterLink({
  text,
  linkLabel,
  onPress,
}: {
  text: string;
  linkLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.footerRow}>
      <Text style={styles.footerText}>{text}</Text>
      <Pressable hitSlop={theme.accessibility.hitSlop} onPress={onPress}>
        <Text style={styles.footerLink}>{linkLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: theme.accessibility.minTouchTarget,
    height: theme.accessibility.minTouchTarget,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingWrap: {
    gap: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.title1,
  },
  subheading: {
    ...theme.typography.bodyMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  field: {
    minHeight: 56,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    ...theme.typography.body,
    flexShrink: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.borderStrong,
  },
  dividerText: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  socialButton: {
    width: 60,
    height: 56,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    ...theme.typography.bodyMuted,
  },
  footerLink: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
});
