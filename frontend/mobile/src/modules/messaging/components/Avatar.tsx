import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import { getInitials } from '../services/formatters';
import { useMessagingStore } from '../store/useMessagingStore';
import { useMessagingPalette } from '../theme';
import type { ConversationKind, PresenceState } from '../types';
import GroupAvatarStack from './GroupAvatarStack';

type AvatarProps = {
  label: string;
  uri?: string;
  color: string;
  kind: ConversationKind;
  participantIds?: string[];
  size?: number;
  online?: boolean;
  presence?: PresenceState;
  verified?: boolean;
};

const PRESENCE_COLORS: Record<PresenceState, string> = {
  online: theme.colors.success,
  away: theme.colors.warning,
  offline: theme.colors.muted,
};

function AvatarComponent({
  label,
  uri,
  color,
  kind,
  participantIds,
  size = 58,
  online,
  presence,
  verified,
}: AvatarProps) {
  const palette = useMessagingPalette();
  const contacts = useMessagingStore((state) => state.contacts);
  const radius = size / 2;
  const isChannel = kind === 'channel';
  const isMultiAvatar = kind === 'group' || kind === 'community';
  const initials = getInitials(label);
  const groupMembers = React.useMemo(
    () =>
      (participantIds ?? [])
        .map((participantId) => contacts.find((contact) => contact.id === participantId))
        .filter((contact): contact is NonNullable<typeof contact> => Boolean(contact))
        .map((contact) => ({
          id: contact.id,
          label: contact.name,
          uri: contact.avatar,
          color: contact.avatarColor,
        })),
    [contacts, participantIds]
  );

  return (
    <View style={styles.wrapper}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />
      ) : isChannel ? (
        <View
          style={[
            styles.channelAvatar,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.border,
            },
          ]}
        >
          <Ionicons name="radio-outline" size={Math.max(22, size * 0.38)} color={palette.icon} />
        </View>
      ) : isMultiAvatar ? (
        <GroupAvatarStack members={groupMembers} size={size} fallbackLabel={label} />
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
          <View style={styles.fallbackGlow} />
          <Text style={[styles.initials, { fontSize: Math.max(15, size * 0.3) }]}>{initials}</Text>
        </View>
      )}

      {(() => {
        const effectivePresence: PresenceState | null = presence ?? (online ? 'online' : null);
        if (!effectivePresence) return null;
        const dotSize = Math.max(12, size * 0.26);
        return (
          <View
            style={[
              styles.onlineDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: PRESENCE_COLORS[effectivePresence],
                borderColor: palette.avatarRing,
              },
            ]}
          />
        );
      })()}

      {verified ? (
        <View style={[styles.verifiedBadge, { borderColor: palette.avatarRing }]}>
          <Ionicons name="checkmark" size={10} color={theme.colors.white} />
        </View>
      ) : null}
    </View>
  );
}

export default React.memo(AvatarComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackGlow: {
    position: 'absolute',
    top: -10,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  initials: {
    color: theme.colors.white,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  channelAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
