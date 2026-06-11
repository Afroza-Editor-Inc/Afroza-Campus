import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import theme from '../../../theme';
import { getInitials } from '../services/formatters';
import { useMessagingPalette } from '../theme';

export type GroupAvatarMember = {
  id: string;
  label: string;
  uri?: string;
  color: string;
};

type GroupAvatarStackProps = {
  members: GroupAvatarMember[];
  size?: number;
  fallbackLabel: string;
};

function AvatarTile({
  color,
  initials,
  label,
  uri,
}: {
  color: string;
  initials: string;
  label: string;
  uri?: string;
}) {
  return uri ? (
    <Image accessibilityLabel={label} source={{ uri }} style={StyleSheet.absoluteFillObject} />
  ) : (
    <View style={[styles.tileFallback, { backgroundColor: color }]}>
      <Text style={styles.tileInitials}>{initials}</Text>
    </View>
  );
}

function GroupAvatarStackComponent({
  members,
  size = 48,
  fallbackLabel,
}: GroupAvatarStackProps) {
  const palette = useMessagingPalette();
  const visibleMembers = members.slice(0, 4);
  const overflowCount = Math.max(0, members.length - 4);
  const fallbackInitials = getInitials(fallbackLabel);

  if (visibleMembers.length === 0) {
    return (
      <View
        style={[
          styles.wrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Text style={[styles.tileInitials, { fontSize: Math.max(15, size * 0.28) }]}>
          {fallbackInitials}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
      ]}
    >
      {visibleMembers.length === 1 ? (
        <View style={styles.fullTile}>
          <AvatarTile
            color={visibleMembers[0].color}
            initials={getInitials(visibleMembers[0].label)}
            label={visibleMembers[0].label}
            uri={visibleMembers[0].uri}
          />
        </View>
      ) : null}

      {visibleMembers.length === 2 ? (
        <>
          {visibleMembers.map((member, index) => (
            <View
              key={member.id}
              style={[
                styles.halfTile,
                index === 0 ? styles.leftTile : styles.rightTile,
                { borderColor: palette.avatarRing },
              ]}
            >
              <AvatarTile
                color={member.color}
                initials={getInitials(member.label)}
                label={member.label}
                uri={member.uri}
              />
            </View>
          ))}
        </>
      ) : null}

      {visibleMembers.length === 3 ? (
        <>
          <View style={[styles.triangleTop, { borderColor: palette.avatarRing }]}>
            <AvatarTile
              color={visibleMembers[0].color}
              initials={getInitials(visibleMembers[0].label)}
              label={visibleMembers[0].label}
              uri={visibleMembers[0].uri}
            />
          </View>
          <View style={[styles.triangleBottomLeft, { borderColor: palette.avatarRing }]}>
            <AvatarTile
              color={visibleMembers[1].color}
              initials={getInitials(visibleMembers[1].label)}
              label={visibleMembers[1].label}
              uri={visibleMembers[1].uri}
            />
          </View>
          <View style={[styles.triangleBottomRight, { borderColor: palette.avatarRing }]}>
            <AvatarTile
              color={visibleMembers[2].color}
              initials={getInitials(visibleMembers[2].label)}
              label={visibleMembers[2].label}
              uri={visibleMembers[2].uri}
            />
          </View>
        </>
      ) : null}

      {visibleMembers.length >= 4 ? (
        <>
          {visibleMembers.map((member, index) => {
            const row = index < 2 ? 0 : 1;
            const column = index % 2;
            const isOverflowTile = overflowCount > 0 && index === 3;

            return (
              <View
                key={member.id}
                style={[
                  styles.gridTile,
                  {
                    top: row === 0 ? 0 : '50%',
                    left: column === 0 ? 0 : '50%',
                    borderColor: palette.avatarRing,
                  },
                ]}
              >
                {isOverflowTile ? (
                  <View style={[styles.overflowTile, { backgroundColor: palette.surfaceStrong }]}>
                    <Text style={[styles.overflowText, { color: palette.text }]}>+{overflowCount}</Text>
                  </View>
                ) : (
                  <AvatarTile
                    color={member.color}
                    initials={getInitials(member.label)}
                    label={member.label}
                    uri={member.uri}
                  />
                )}
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

export default React.memo(GroupAvatarStackComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  fullTile: {
    ...StyleSheet.absoluteFillObject,
  },
  halfTile: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    overflow: 'hidden',
    borderWidth: 1,
  },
  leftTile: {
    left: 0,
  },
  rightTile: {
    right: 0,
  },
  triangleTop: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    borderWidth: 1,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  triangleBottomLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    borderWidth: 1,
  },
  triangleBottomRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    borderWidth: 1,
  },
  gridTile: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    borderWidth: 1,
  },
  tileFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileInitials: {
    color: theme.colors.white,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  overflowTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
