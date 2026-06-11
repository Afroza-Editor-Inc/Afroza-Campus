import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface ReadReceiptProps {
  isRead: boolean;
  isSending?: boolean;
  size?: number;
}

export function ReadReceipt({
  isRead,
  isSending,
  size = 14,
}: ReadReceiptProps) {
  if (isSending) {
    return (
      <Ionicons
        name="hourglass-outline"
        size={size}
        color={theme.colors.textMuted}
      />
    );
  }

  if (isRead) {
    return (
      <Ionicons
        name="checkmark-done"
        size={size}
        color={theme.colors.primary}
      />
    );
  }

  return (
    <Ionicons
      name="checkmark"
      size={size}
      color={theme.colors.textMuted}
    />
  );
}

const styles = StyleSheet.create({
  // No additional styles needed
});
