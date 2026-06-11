import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import { getInitials, kindIcon } from '../utils/formatters';
import type { ConversationKind } from '../types';

type MessagingAvatarProps = {
  uri?: string;
  label: string;
  size?: number;
  color: string;
  kind: ConversationKind;
  online?: boolean;
  verified?: boolean;
};

export default function MessagingAvatar({
  uri,
  label,
  size = 58,
  color,
  kind,
  online,
  verified,
}: MessagingAvatarProps) {
  const isSquare = kind === 'community' || kind === 'channel';
  const radius = isSquare ? 20 : size / 2;

  return (
    <View style={styles.wrapper}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: color,
            },
          ]}
        >
          <Text style={styles.initials}>{getInitials(label)}</Text>
        </View>
      )}

      <View style={styles.kindBadge}>
        <Ionicons name={kindIcon(kind)} size={12} color={theme.colors.white} />
      </View>

      {online ? <View style={styles.onlineDot} /> : null}
      {verified ? (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={10} color={theme.colors.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  kindBadge: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  onlineDot: {
    position: 'absolute',
    top: 1,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});
