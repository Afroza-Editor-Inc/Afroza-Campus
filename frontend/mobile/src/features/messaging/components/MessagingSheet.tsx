import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';

export type SheetOption = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone?: 'default' | 'danger';
  onPress: () => void;
};

type MessagingSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  options: SheetOption[];
  children?: React.ReactNode;
};

export default function MessagingSheet({
  visible,
  title,
  subtitle,
  onClose,
  options,
  children,
}: MessagingSheetProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {children ? <View style={styles.content}>{children}</View> : null}

          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    option.tone === 'danger' && styles.optionIconDanger,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={option.tone === 'danger' ? theme.colors.danger : theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    option.tone === 'danger' && styles.optionLabelDanger,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 12, 21, 0.34)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    maxHeight: '78%',
    ...theme.shadows.floating,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.borderStrong,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.title3,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 58,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
  },
  optionRowPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  optionIconDanger: {
    backgroundColor: 'rgba(229, 82, 82, 0.12)',
  },
  optionLabel: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  optionLabelDanger: {
    color: theme.colors.danger,
  },
});
