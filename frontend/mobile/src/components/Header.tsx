import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import theme from '../theme';

interface Props {
  title?: string;
  showActions?: boolean;
}

export default function Header({ title, showActions = true }: Props) {
  const platformShadow = Platform.OS === 'ios' ? styles.iosShadow : ({ elevation: 3 } as any);

  return (
    <View style={[styles.container, platformShadow]}>
      <Text style={styles.logo}>{title || 'AFROZA CAMPUS'}</Text>
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.action}>
            <Text>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action}>
            <Text>✈️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 20,
  },
  logo: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    marginLeft: theme.spacing.md,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  }
});