import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

type CommunityCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  /** Lettre/emoji affiché dans l'avatar gradient. */
  glyph: string;
  icon?: keyof typeof Ionicons.glyphMap;
  unread?: number;
  verified?: boolean;
  trailingLabel?: string;
  onPress?: () => void;
};

function CommunityCardComponent({
  title,
  subtitle,
  meta,
  glyph,
  icon,
  unread,
  verified,
  trailingLabel,
  onPress,
}: CommunityCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        hapticFeedback.light();
        onPress?.();
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <LinearGradient
        colors={theme.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        {icon ? (
          <Ionicons name={icon} size={22} color={theme.colors.white} />
        ) : (
          <Text style={styles.avatarGlyph}>{glyph}</Text>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {verified ? (
            <Ionicons name="checkmark-circle" size={15} color={theme.colors.primary} />
          ) : null}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailing}>
        {unread && unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
          </View>
        ) : null}
        {trailingLabel ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{trailingLabel}</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

export default React.memo(CommunityCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    paddingRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardPressed: {
    backgroundColor: theme.colors.surfaceMuted,
    transform: [{ scale: 0.99 }],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
    flexShrink: 1,
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    color: theme.colors.text,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  pill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  pillText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '700',
  },
});
