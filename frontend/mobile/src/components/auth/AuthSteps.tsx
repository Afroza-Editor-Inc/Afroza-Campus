import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../theme';

export function AuthSteps({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.segment, index < current ? styles.segmentActive : styles.segmentIdle]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  segmentActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentIdle: {
    backgroundColor: theme.colors.surfaceStrong,
  },
});
