import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';
import { useReelsStore } from '../../store/reelsStore';

const CARD_GRADIENTS: Array<readonly [string, string]> = [
  ['#0072FF', '#00A3FF'],
  ['#00A3FF', '#00FF6A'],
  ['#00C557', '#80FF00'],
  ['#0072FF', '#00FF6A'],
];

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${value}`;
}

export function ReelsCarousel() {
  const navigation = useNavigation<any>();
  const reels = useReelsStore((state) => state.reels);

  const open = (index: number) => {
    hapticFeedback.light();
    navigation.navigate('Reels', { startIndex: index });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>REELS</Text>
        <Pressable onPress={() => open(0)} hitSlop={theme.accessibility.hitSlop}>
          <Text style={styles.seeAll}>Tout voir</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {reels.map((reel, index) => (
          <Pressable
            key={reel.id}
            accessibilityRole="button"
            accessibilityLabel={`Reel de ${reel.userName}`}
            onPress={() => open(index)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <LinearGradient
              colors={CARD_GRADIENTS[index % CARD_GRADIENTS.length]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.playPill}>
              <Ionicons name="play" size={14} color={theme.colors.white} />
              <Text style={styles.playText}>{formatCount(reel.likes)}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>{reel.userName[0]}</Text>
              </View>
              <Text style={styles.authorName} numberOfLines={1}>
                {reel.userName}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.textStrong,
    letterSpacing: 1.5,
  },
  seeAll: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  row: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  card: {
    width: 116,
    height: 188,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  playPill: {
    position: 'absolute',
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: theme.spacing.xs,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  authorAvatarText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  authorName: {
    flex: 1,
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
