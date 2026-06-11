import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export type FeaturedCommunity = {
  id: string;
  name: string;
  description: string;
  members: number;
  glyph: string;
  gradient: readonly [string, string, ...string[]];
};

const DEFAULT_FEATURED: FeaturedCommunity[] = [
  {
    id: 'f1',
    name: 'Campus Digital',
    description: 'Tech, code & innovation',
    members: 1250,
    glyph: 'CD',
    gradient: theme.gradients.brand,
  },
  {
    id: 'f2',
    name: 'Entrepreneuriat',
    description: 'Startups & projets étudiants',
    members: 860,
    glyph: 'E',
    gradient: ['#00A3FF', '#0072FF'] as const,
  },
  {
    id: 'f3',
    name: 'Arts & Culture',
    description: 'Expos, concerts, théâtre',
    members: 720,
    glyph: 'A',
    gradient: ['#00C557', '#00A3FF'] as const,
  },
];

function formatMembers(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k membres`;
  }
  return `${count} membres`;
}

type Props = {
  data?: FeaturedCommunity[];
  onPress?: (community: FeaturedCommunity) => void;
};

function FeaturedCommunitiesComponent({ data = DEFAULT_FEATURED, onPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>À la une</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {data.map((community) => (
          <Pressable
            key={community.id}
            accessibilityRole="button"
            accessibilityLabel={community.name}
            onPress={() => {
              hapticFeedback.light();
              onPress?.(community);
            }}
            style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={community.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={styles.glyphBadge}>
                  <Text style={styles.glyphText}>{community.glyph}</Text>
                </View>
                <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.9)" />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>
                  {community.name}
                </Text>
                <Text style={styles.description} numberOfLines={1}>
                  {community.description}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.members}>{formatMembers(community.members)}</Text>
                <View style={styles.joinPill}>
                  <Text style={styles.joinText}>Rejoindre</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default React.memo(FeaturedCommunitiesComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
    marginBottom: theme.spacing.sm,
  },
  row: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  cardWrap: {
    width: 244,
    borderRadius: theme.radii.lg,
    ...theme.shadows.card,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  card: {
    height: 152,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glyphBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  cardBody: {
    gap: 2,
  },
  name: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  members: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  joinPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.white,
  },
  joinText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
  },
});
