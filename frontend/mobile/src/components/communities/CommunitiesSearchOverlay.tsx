import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';
import { EmptyState } from '../feedback';

type Category = 'all' | 'communities' | 'groups' | 'projects' | 'resources' | 'events';

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: 'all', label: 'Tout' },
  { key: 'communities', label: 'Communautés' },
  { key: 'groups', label: 'Groupes' },
  { key: 'projects', label: 'Projets' },
  { key: 'resources', label: 'Ressources' },
  { key: 'events', label: 'Événements' },
];

const RECENT = ['Dev Club', 'Projet IA', 'Hackathon Afroza', '#Algorithmes'];

type Result = {
  id: string;
  category: Exclude<Category, 'all'>;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string, ...string[]];
};

const RESULTS: Result[] = [
  { id: 'r1', category: 'communities', title: 'Campus Digital', subtitle: '1.2k membres · Tech', icon: 'planet', colors: theme.gradients.ocean },
  { id: 'r2', category: 'communities', title: 'Arts & Culture', subtitle: '720 membres', icon: 'planet', colors: theme.gradients.aqua },
  { id: 'r3', category: 'groups', title: 'Informatique 2024', subtitle: '45 membres · Groupe de promo', icon: 'people', colors: theme.gradients.mint },
  { id: 'r4', category: 'groups', title: 'Bureau des étudiants', subtitle: '312 membres', icon: 'people', colors: theme.gradients.ocean },
  { id: 'r5', category: 'projects', title: 'Projet IA — Vision', subtitle: '68% · 4 tâches ouvertes', icon: 'rocket', colors: theme.gradients.aqua },
  { id: 'r6', category: 'resources', title: 'Notes Algorithmes', subtitle: 'Document · Informatique', icon: 'document-text', colors: theme.gradients.mint },
  { id: 'r7', category: 'events', title: 'Hackathon Afroza', subtitle: 'Sam. 14 Juin · 218 inscrits', icon: 'calendar', colors: theme.gradients.ocean },
];

export default function CommunitiesSearchOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<Category>('all');
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    if (visible) {
      setQuery('');
      setCategory('all');
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESULTS.filter((item) => {
      const matchCategory = category === 'all' || item.category === category;
      const matchQuery = !q || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [category, query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={[styles.container, { paddingTop: insets.top + theme.spacing.xs }]}>
        <View style={styles.searchRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer la recherche"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.selection();
              onClose();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textStrong} />
          </Pressable>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Communautés, groupes, projets…"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable hitSlop={theme.accessibility.hitSlop} onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {CATEGORIES.map((item) => {
            const active = item.key === category;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={active ? { selected: true } : {}}
                onPress={() => {
                  hapticFeedback.selection();
                  setCategory(item.key);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {query.length === 0 && category === 'all' ? (
          <View style={styles.recentWrap}>
            <Text style={styles.recentTitle}>Recherches récentes</Text>
            {RECENT.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => {
                  hapticFeedback.selection();
                  setQuery(item);
                }}
                style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}
              >
                <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
                <Text style={styles.recentText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
            {results.length === 0 ? (
              <Animated.View entering={FadeIn.duration(200)} style={styles.emptyWrap}>
                <EmptyState icon="search-outline" title="Aucun résultat" subtitle="Essayez un autre mot-clé ou une autre catégorie." />
              </Animated.View>
            ) : (
              results.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 30).duration(200)}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    onPress={() => {
                      hapticFeedback.selection();
                      onClose();
                    }}
                    style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
                  >
                    <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.resultIcon}>
                      <Ionicons name={item.icon} size={20} color={theme.colors.white} />
                    </LinearGradient>
                    <View style={styles.flex}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                </Animated.View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  flex: { flex: 1 },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textStrong,
    paddingVertical: 0,
  },
  chipsRow: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  recentWrap: {
    paddingTop: theme.spacing.sm,
  },
  recentTitle: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
    marginBottom: theme.spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  recentText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textStrong,
  },
  results: {
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xxl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  resultIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  resultSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyWrap: {
    paddingTop: theme.spacing.xxl,
  },
});
