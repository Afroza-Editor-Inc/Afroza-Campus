import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { ListSkeleton } from '../components/feedback';
import CommunitiesSearchOverlay from '../components/communities/CommunitiesSearchOverlay';
import FloatingAnchorMenu, { type FloatingMenuSection } from '../components/overlays/FloatingAnchorMenu';
import ModuleMenu, { type ModuleMenuSection } from '../components/navigation/ModuleMenu';

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = 'community' | 'group' | 'project' | 'event';

const QUICK_CREATE: Array<{ key: Kind; label: string; icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string, ...string[]] }> = [
  { key: 'community', label: 'Communauté', icon: 'planet', colors: theme.gradients.ocean },
  { key: 'group', label: 'Groupe', icon: 'people', colors: theme.gradients.mint },
  { key: 'project', label: 'Projet', icon: 'rocket', colors: theme.gradients.aqua },
  { key: 'event', label: 'Événement', icon: 'calendar', colors: [theme.colors.primaryDeep, theme.colors.primary] as const },
];

const MY_COMMUNITIES = [
  { id: 'c1', name: 'Campus Digital', members: 1250, activity: 'Actif maintenant', colors: theme.gradients.ocean },
  { id: 'c2', name: 'Sports & Loisirs', members: 890, activity: '12 nouveaux posts', colors: theme.gradients.mint },
  { id: 'c3', name: 'Arts & Culture', members: 720, activity: 'Événement ce soir', colors: theme.gradients.aqua },
];

const MY_GROUPS = [
  { id: 'g1', name: 'Informatique 2024', online: 8, last: 'Alice : Projet IA terminé !', unread: 3 },
  { id: 'g2', name: 'Promo L3 Maths', online: 3, last: 'Karim : Révisions demain ?', unread: 0 },
  { id: 'g3', name: 'Département Design', online: 5, last: 'Sophie : Nouvelles maquettes', unread: 1 },
];

const MY_PROJECTS = [
  { id: 'p1', title: 'Projet IA — Vision', progress: 0.68, due: '14 Juin', openTasks: 4, leads: ['A', 'K', 'S'] },
  { id: 'p2', title: 'Refonte site BDE', progress: 0.35, due: '22 Juin', openTasks: 7, leads: ['Y', 'L'] },
];

const MY_EVENTS: Array<{ id: string; title: string; date: string; going: number; icon: keyof typeof Ionicons.glyphMap; type: string }> = [
  { id: 'e1', title: 'Hackathon Afroza', date: 'Sam. 14 Juin · 09h', going: 218, icon: 'rocket-outline', type: 'Hackathon' },
  { id: 'e2', title: 'Atelier UX Design', date: 'Lun. 16 Juin · 14h', going: 64, icon: 'color-palette-outline', type: 'Atelier' },
  { id: 'e3', title: 'Soutenance projets', date: 'Jeu. 19 Juin · 10h', going: 120, icon: 'school-outline', type: 'Soutenance' },
];

const RESOURCE_CATEGORIES = ['Tout', 'Documents', 'PDF', 'Présentations', 'Cours', 'Notes'];

const RESOURCES: Array<{ id: string; title: string; category: string; meta: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'res1', title: 'Notes Algorithmes', category: 'Notes', meta: 'Informatique · 12 pages', icon: 'document-text-outline' },
  { id: 'res2', title: 'Slides Soutenance', category: 'Présentations', meta: 'Design · 24 slides', icon: 'easel-outline' },
  { id: 'res3', title: 'Cours Réseaux.pdf', category: 'PDF', meta: 'Réseaux · 4.2 Mo', icon: 'document-attach-outline' },
  { id: 'res4', title: 'Polycopié Maths', category: 'Cours', meta: 'Mathématiques · 68 pages', icon: 'book-outline' },
];

const SUGGESTIONS = [
  { id: 's1', name: 'Sciences & Recherche', members: 640, reason: 'Filière Informatique', colors: theme.gradients.ocean },
  { id: 's2', name: 'Entrepreneuriat Campus', members: 210, reason: 'Centres d’intérêt', colors: theme.gradients.mint },
  { id: 's3', name: 'Mobilité internationale', members: 430, reason: 'Université', colors: theme.gradients.aqua },
];

function formatMembers(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k membres`;
  return `${count} membres`;
}

/* -------------------------------------------------------------------------- */
/* Section pieces                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable hitSlop={theme.accessibility.hitSlop} onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <LinearGradient
        colors={theme.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${Math.round(value * 100)}%` }]}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

export default function CommunitiesScreen() {
  const navigation = useNavigation<any>();
  const [booting, setBooting] = React.useState(true);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [moduleMenuVisible, setModuleMenuVisible] = React.useState(false);
  const [quickCreateVisible, setQuickCreateVisible] = React.useState(false);
  const [menuTarget, setMenuTarget] = React.useState<{ title: string; joined: boolean } | null>(null);
  const [resourceCategory, setResourceCategory] = React.useState('Tout');

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 480);
    return () => clearTimeout(timer);
  }, []);

  const openDetail = (name: string, members?: number, initialTab?: string) => {
    hapticFeedback.light();
    navigation.navigate('CommunityDetail', { name, glyph: name[0], members, initialTab });
  };

  const createKind = (kind: Kind) => {
    hapticFeedback.medium();
    if (kind === 'event') {
      navigation.navigate('ScheduleMeeting', { kind: 'meeting' });
      return;
    }
    navigation.navigate('CreateCommunity', { kind });
  };

  const filteredResources = React.useMemo(
    () => (resourceCategory === 'Tout' ? RESOURCES : RESOURCES.filter((item) => item.category === resourceCategory)),
    [resourceCategory]
  );

  const moduleMenuSections: ModuleMenuSection[] = React.useMemo(
    () => [
      {
        title: 'Mes espaces',
        items: [
          { key: 'projects', label: 'Mes projets', icon: 'rocket-outline', onPress: () => openDetail('Informatique 2024', 45, 'projects') },
          { key: 'resources', label: 'Mes ressources', icon: 'folder-open-outline', onPress: () => setSearchVisible(true) },
          { key: 'events', label: 'Mes événements', icon: 'calendar-outline', onPress: () => navigation.navigate('ScheduleMeeting', { kind: 'meeting' }) },
        ],
      },
      {
        title: 'Communauté',
        items: [
          { key: 'communities', label: 'Mes communautés', icon: 'planet-outline', onPress: () => setSearchVisible(true) },
          { key: 'groups', label: 'Mes groupes', icon: 'people-outline', onPress: () => setSearchVisible(true) },
          { key: 'settings', label: 'Paramètres', icon: 'settings-outline', onPress: () => navigation.navigate('Settings') },
        ],
      },
    ],
    [navigation]
  );

  const quickCreateSections: FloatingMenuSection[] = React.useMemo(
    () => [
      {
        items: [
          { label: 'Nouveau projet', icon: 'rocket-outline', onPress: () => navigation.navigate('CreateCommunity', { kind: 'project' }) },
          { label: 'Nouvelle tâche', icon: 'checkbox-outline', onPress: () => openDetail('Informatique 2024', 45, 'projects') },
          { label: 'Nouvelle ressource', icon: 'document-attach-outline', onPress: () => openDetail('Informatique 2024', 45, 'resources') },
        ],
      },
    ],
    [navigation]
  );

  const menuSections: FloatingMenuSection[] = React.useMemo(() => {
    if (!menuTarget) return [];
    return [
      {
        items: [
          { label: 'Partager', icon: 'paper-plane-outline', onPress: hapticFeedback.light },
          { label: 'Enregistrer', icon: 'bookmark-outline', onPress: hapticFeedback.light },
          menuTarget.joined
            ? { label: 'Quitter', icon: 'exit-outline', onPress: hapticFeedback.medium }
            : { label: 'Rejoindre', icon: 'add-circle-outline', onPress: hapticFeedback.medium },
        ],
      },
      {
        items: [{ label: 'Signaler', icon: 'flag-outline', onPress: hapticFeedback.error, destructive: true }],
      },
    ];
  }, [menuTarget]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Création rapide"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => {
            hapticFeedback.selection();
            setQuickCreateVisible(true);
          }}
        >
          <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickPlus}>
            <Ionicons name="add" size={22} color={theme.colors.white} />
          </LinearGradient>
        </Pressable>

        <Text style={styles.headerTitle}>COMMUNAUTÉS</Text>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.selection();
              navigation.navigate('Notifications');
            }}
            style={styles.headerIcon}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.textStrong} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Menu communautés"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.selection();
              setModuleMenuVisible(true);
            }}
            style={styles.headerIcon}
          >
            <Ionicons name="menu-outline" size={22} color={theme.colors.textStrong} />
          </Pressable>
        </View>
      </View>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Rechercher"
        onPress={() => {
          hapticFeedback.selection();
          setSearchVisible(true);
        }}
        style={styles.searchTrigger}
      >
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Projets, communautés, événements, ressources…</Text>
      </Pressable>

      {booting ? (
        <View style={styles.skeletonWrap}>
          <ListSkeleton count={6} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: theme.navigation.barHeight + 40 }]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {QUICK_CREATE.map((action, index) => (
              <Animated.View key={action.key} entering={FadeInDown.delay(index * 50).duration(220)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Créer : ${action.label}`}
                  onPress={() => createKind(action.key)}
                  style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
                >
                  <LinearGradient colors={action.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickIcon}>
                    <Ionicons name={action.icon} size={22} color={theme.colors.white} />
                  </LinearGradient>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          <View>
            <SectionHeader title="Mes communautés" actionLabel="Tout voir" onAction={() => setSearchVisible(true)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {MY_COMMUNITIES.map((community) => (
                <Pressable
                  key={community.id}
                  accessibilityRole="button"
                  accessibilityLabel={community.name}
                  onPress={() => openDetail(community.name, community.members)}
                  style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}
                >
                  <LinearGradient colors={community.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.communityCover}>
                    <View style={styles.communityCoverPattern} />
                    <View style={styles.activityBadge}>
                      <View style={styles.activityDot} />
                      <Text style={styles.activityText} numberOfLines={1}>{community.activity}</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.communityBody}>
                    <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
                    <Text style={styles.communityMeta}>{formatMembers(community.members)}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View>
            <SectionHeader title="Mes groupes" actionLabel="Gérer" onAction={() => setSearchVisible(true)} />
            {MY_GROUPS.map((group) => (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                accessibilityLabel={group.name}
                onPress={() => openDetail(group.name, undefined, 'about')}
                style={({ pressed }) => [styles.groupRow, pressed && styles.pressed]}
              >
                <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.groupAvatar}>
                  <Text style={styles.groupAvatarText}>{group.name[0]}</Text>
                </LinearGradient>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{group.name}</Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>{group.last}</Text>
                  <View style={styles.onlineRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>{group.online} en ligne</Text>
                  </View>
                </View>
                <View style={styles.groupTrailing}>
                  {group.unread > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{group.unread}</Text>
                    </View>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Options ${group.name}`}
                    hitSlop={theme.accessibility.hitSlop}
                    onPress={() => {
                      hapticFeedback.selection();
                      setMenuTarget({ title: group.name, joined: true });
                    }}
                    style={styles.moreButton}
                  >
                    <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>

          <View>
            <SectionHeader title="Mes projets" actionLabel="Tableau" onAction={() => openDetail('Informatique 2024', 45, 'projects')} />
            {MY_PROJECTS.map((project) => (
              <Pressable
                key={project.id}
                accessibilityRole="button"
                accessibilityLabel={project.title}
                onPress={() => openDetail(project.title, undefined, 'projects')}
                style={({ pressed }) => [styles.projectCard, pressed && styles.pressed]}
              >
                <View style={styles.projectTop}>
                  <View style={styles.projectIcon}>
                    <Ionicons name="rocket-outline" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.projectTitle} numberOfLines={1}>{project.title}</Text>
                  <View style={styles.dueBadge}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.primaryDeep} />
                    <Text style={styles.dueText}>{project.due}</Text>
                  </View>
                </View>
                <ProgressBar value={project.progress} />
                <View style={styles.projectFooter}>
                  <View style={styles.leadsRow}>
                    {project.leads.map((lead, index) => (
                      <View key={`${project.id}-${lead}-${index}`} style={[styles.leadAvatar, { marginLeft: index === 0 ? 0 : -8 }]}>
                        <Text style={styles.leadText}>{lead}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.openTasks}>{Math.round(project.progress * 100)}% · {project.openTasks} tâches ouvertes</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View>
            <SectionHeader title="Mes événements" actionLabel="Calendrier" onAction={() => navigation.navigate('ScheduleMeeting', { kind: 'meeting' })} />
            {MY_EVENTS.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.eventIcon}>
                  <Ionicons name={event.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.itemMeta}>{event.date} · {event.going} intéressés</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Participer à ${event.title}`}
                  onPress={() => {
                    hapticFeedback.medium();
                    navigation.navigate('ActiveCall', { name: event.title, callType: 'video', mode: 'conference' });
                  }}
                  style={styles.eventJoin}
                >
                  <Text style={styles.eventJoinText}>Participer</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View>
            <SectionHeader title="Ressources académiques" actionLabel="Parcourir" onAction={() => setSearchVisible(true)} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resourceChips}>
              {RESOURCE_CATEGORIES.map((cat) => {
                const active = cat === resourceCategory;
                return (
                  <Pressable
                    key={cat}
                    accessibilityRole="button"
                    accessibilityState={active ? { selected: true } : {}}
                    onPress={() => {
                      hapticFeedback.selection();
                      setResourceCategory(cat);
                    }}
                    style={[styles.resourceChip, active && styles.resourceChipActive]}
                  >
                    <Text style={[styles.resourceChipText, active && styles.resourceChipTextActive]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {filteredResources.map((resource) => (
              <Pressable
                key={resource.id}
                accessibilityRole="button"
                accessibilityLabel={resource.title}
                onPress={hapticFeedback.light}
                style={({ pressed }) => [styles.resourceRow, pressed && styles.pressed]}
              >
                <View style={styles.resourceIcon}>
                  <Ionicons name={resource.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{resource.title}</Text>
                  <Text style={styles.itemMeta}>{resource.meta}</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </View>

          <View>
            <SectionHeader title="Suggestions" actionLabel="Tout voir" onAction={() => setSearchVisible(true)} />
            {SUGGESTIONS.map((item) => (
              <View key={item.id} style={styles.suggestionRow}>
                <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.suggestionAvatar}>
                  <Ionicons name="planet" size={22} color={theme.colors.white} />
                </LinearGradient>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{formatMembers(item.members)} · {item.reason}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Rejoindre ${item.name}`}
                  onPress={() => {
                    hapticFeedback.medium();
                    openDetail(item.name, item.members);
                  }}
                  style={styles.joinPill}
                >
                  <Text style={styles.joinPillText}>Rejoindre</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Options ${item.name}`}
                  hitSlop={theme.accessibility.hitSlop}
                  onPress={() => {
                    hapticFeedback.selection();
                    setMenuTarget({ title: item.name, joined: false });
                  }}
                  style={styles.moreButton}
                >
                  <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <CommunitiesSearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />

      <ModuleMenu
        visible={moduleMenuVisible}
        onClose={() => setModuleMenuVisible(false)}
        moduleLabel="Communautés"
        moduleIcon="people-outline"
        sections={moduleMenuSections}
      />

      <FloatingAnchorMenu
        visible={quickCreateVisible}
        onClose={() => setQuickCreateVisible(false)}
        title="Créer"
        subtitle="Projet, tâche ou ressource"
        sections={quickCreateSections}
        anchor="top-left"
      />

      <FloatingAnchorMenu
        visible={menuTarget !== null}
        onClose={() => setMenuTarget(null)}
        title={menuTarget?.title}
        subtitle="Communauté"
        sections={menuSections}
        anchor="top-right"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: { flex: 1 },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    color: theme.colors.textStrong,
  },
  quickPlus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: 44,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },

  /* Scroll */
  skeletonWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  scroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  sectionAction: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  itemTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  itemMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  /* Quick create */
  quickRow: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  quickTile: {
    width: 96,
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...theme.typography.caption,
    color: theme.colors.textStrong,
    fontWeight: '700',
  },

  /* Communities horizontal */
  hRow: {
    gap: theme.spacing.sm,
    paddingVertical: 2,
  },
  communityCard: {
    width: 200,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  communityCover: {
    height: 80,
    padding: theme.spacing.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  communityCoverPattern: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary,
  },
  activityText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 130,
  },
  communityBody: {
    padding: theme.spacing.sm,
    gap: 2,
  },
  communityName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  communityMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },

  /* Group row */
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondaryDeep,
  },
  onlineText: {
    ...theme.typography.caption,
    color: theme.colors.secondaryDeep,
    fontWeight: '600',
  },
  groupTrailing: {
    alignItems: 'center',
    gap: 6,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  moreButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Project card */
  projectCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  projectTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  dueText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceStrong,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  leadText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  openTasks: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },

  /* Event row */
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventJoin: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  eventJoinText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  /* Resources */
  resourceChips: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  resourceChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 34,
    justifyContent: 'center',
  },
  resourceChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  resourceChipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  resourceChipTextActive: {
    color: theme.colors.white,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  resourceIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Suggestions */
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  suggestionAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  joinPillText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '700',
  },
});
