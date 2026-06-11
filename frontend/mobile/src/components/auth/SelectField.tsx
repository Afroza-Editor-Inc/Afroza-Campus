import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

type SelectFieldProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export default function SelectField({
  icon,
  placeholder,
  value,
  options,
  onSelect,
  disabled,
}: SelectFieldProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          disabled && styles.fieldDisabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item}</Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  fieldDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  value: {
    ...theme.typography.body,
    flex: 1,
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.borderStrong,
    marginBottom: theme.spacing.md,
  },
  sheetTitle: {
    ...theme.typography.title3,
    marginBottom: theme.spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  optionText: {
    ...theme.typography.body,
    fontSize: 16,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
