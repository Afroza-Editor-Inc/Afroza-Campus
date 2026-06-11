import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { EmptyState } from '../../../components/feedback';

type Category = 'all' | 'people' | 'groups' | 'communities' | 'messages';

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: 'all', label: 'Tout' },
  { key: 'people', label: 'Utilisateurs' },
  { key: 'groups', label: 'Groupes' },
  { key: 'communities', label: 'Communautés' },
  { key: 'messages', label: 'Messages' },
];

const RECENT = ['Alice Dupont', 'Groupe Promo L3', 'Dev Club', 'réunion projet'];

type Result = {
  id: string;
  category: Exclude<Category, 'all'>;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string, ...string[]];
};

const RESULTS: Result[] = [
  { id: 'm1', category: 'people', title: 'Alice Dupont', subtitle: 'En ligne · @alice', icon: 'person', colors: theme.gradients.ocean },
  { id: 'm2', category: 'people', title: 'Karim Benali', subtitle: 'Vu il y a 5 min', icon: 'person', colors: theme.gradients.aqua },
  { id: 'm3', category: 'groups', title: 'Promo L3 Maths', subtitle: '24 membres', icon: 'people', colors: theme.gradients.mint },
  { id: 'm4', category: 'groups', title: 'Projet IA — équipe', subtitle: '6 membres', icon: 'people', colors: theme.gradients.ocean },
  { id: 'm5', category: 'communities', title: 'Campus Digital', subtitle: '1.2k membres', icon: 'planet', colors: theme.gradients.aqua },
  { id: 'm6', category: 'messages', title: '« réunion projet demain »', subtitle: 'Alice Dupont · hier', icon: 'chatbubble-ellipses', colors: theme.gradients.mint },
  { id: 'm7', category: 'messages', title: '« on se voit au BDE »', subtitle: 'Groupe Promo L3 · lun.', icon: 'chatbubble-ellipses', colors: theme.gradients.ocean },
];

const SUGGESTIONS: Array<{ id: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'sg1', label: 'Bureau des étudiants', icon: 'people-outline' },
  { id: 'sg2', label: 'Sophie Martin', icon: 'person-outline' },
  { id: 'sg3', label: 'Campus Digital', icon: 'planet-outline' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function MessagingSearchOverlay({ visible, onClose }: Props) {
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

  const showDiscovery = query.length === 0 && category === 'all';

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
              placeholder="Utilisateurs, groupes, messages…"
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

        {showDiscovery ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.discovery}>
            <Text style={styles.blockTitle}>Recherches récentes</Text>
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
                <Ionicons name="arrow-up-outline" size={16} color={theme.colors.textMuted} style={styles.recentArrow} />
              </Pressable>
            ))}

            <Text style={[styles.blockTitle, styles.blockTitleSpaced]}>Suggestions</Text>
            {SUGGESTIONS.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  hapticFeedback.selection();
                  setQuery(item.label);
                }}
                style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.recentText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </ScrollView>
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
  discovery: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  blockTitle: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
    marginBottom: theme.spacing.sm,
  },
  blockTitleSpaced: {
    marginTop: theme.spacing.lg,
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
  recentArrow: {
    transform: [{ rotate: '45deg' }],
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 23,
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
