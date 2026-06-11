import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import SegmentedTabs from '../components/SegmentedTabs';
import { ListSkeleton } from '../components/feedback';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

type DetailParams = {
  CommunityDetail: {
    name: string;
    glyph?: string;
    members?: number;
    description?: string;
    initialTab?: string;
  };
};

const DETAIL_TABS = [
  { key: 'about', label: 'À propos' },
  { key: 'projects', label: 'Projets' },
  { key: 'resources', label: 'Ressources' },
  { key: 'members', label: 'Membres' },
];

type Task = { id: string; title: string; assignee: string; due: string };
type Column = { key: string; title: string; tint: string; tasks: Task[] };

const INITIAL_BOARD: Column[] = [
  {
    key: 'todo',
    title: 'À faire',
    tint: theme.colors.textMuted,
    tasks: [
      { id: 't1', title: 'Rédiger le cahier des charges', assignee: 'Alice', due: 'Lun' },
      { id: 't2', title: 'Maquettes écran d’accueil', assignee: 'Karim', due: 'Mar' },
    ],
  },
  {
    key: 'doing',
    title: 'En cours',
    tint: theme.colors.warning,
    tasks: [{ id: 't3', title: 'API authentification', assignee: 'Sophie', due: 'Mer' }],
  },
  {
    key: 'done',
    title: 'Terminé',
    tint: theme.colors.secondaryDeep,
    tasks: [{ id: 't4', title: 'Setup du repo', assignee: 'Yann', due: 'Fait' }],
  },
];

type Resource = { id: string; title: string; type: string; icon: keyof typeof Ionicons.glyphMap };

const INITIAL_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Notes de cours — Algorithmes', type: 'Document', icon: 'document-text-outline' },
  { id: 'r2', title: 'Slides présentation finale', type: 'Présentation', icon: 'easel-outline' },
  { id: 'r3', title: 'Dataset projet IA.csv', type: 'Fichier', icon: 'server-outline' },
  { id: 'r4', title: 'Lien Figma maquettes', type: 'Lien', icon: 'link-outline' },
];

const RESOURCE_TYPES: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'Document', icon: 'document-text-outline' },
  { label: 'Présentation', icon: 'easel-outline' },
  { label: 'Fichier', icon: 'server-outline' },
  { label: 'Lien', icon: 'link-outline' },
  { label: 'Note', icon: 'create-outline' },
];

function iconForType(type: string): keyof typeof Ionicons.glyphMap {
  return RESOURCE_TYPES.find((item) => item.label === type)?.icon ?? 'document-text-outline';
}

const MEMBERS = [
  { id: 'm1', name: 'Alice Dupont', role: 'Admin' },
  { id: 'm2', name: 'Karim Benali', role: 'Modérateur' },
  { id: 'm3', name: 'Sophie Martin', role: 'Membre' },
  { id: 'm4', name: 'Yann Leroy', role: 'Membre' },
];

export default function CommunityDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DetailParams, 'CommunityDetail'>>();
  const params = route.params ?? { name: 'Communauté' };
  const [tab, setTab] = useState(params.initialTab ?? 'about');

  const [board, setBoard] = useState<Column[]>(INITIAL_BOARD);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [composer, setComposer] = useState<{ mode: 'task' | 'resource'; columnKey?: string } | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftType, setDraftType] = useState('Document');
  const [taskMenu, setTaskMenu] = useState<{ task: Task; columnKey: string } | null>(null);
  const [booting, setBooting] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const glyph = (params.glyph ?? params.name?.[0] ?? '?').toUpperCase();

  const openComposer = (mode: 'task' | 'resource', columnKey?: string) => {
    hapticFeedback.light();
    setDraftText('');
    setDraftType('Document');
    setComposer({ mode, columnKey });
  };

  const submitComposer = () => {
    const value = draftText.trim();
    if (!value || !composer) return;
    hapticFeedback.medium();

    if (composer.mode === 'task') {
      const columnKey = composer.columnKey ?? 'todo';
      setBoard((prev) =>
        prev.map((column) =>
          column.key === columnKey
            ? {
                ...column,
                tasks: [
                  ...column.tasks,
                  { id: `t-${Date.now()}`, title: value, assignee: 'Vous', due: '—' },
                ],
              }
            : column
        )
      );
    } else {
      setResources((prev) => [
        { id: `r-${Date.now()}`, title: value, type: draftType, icon: iconForType(draftType) },
        ...prev,
      ]);
    }

    setComposer(null);
    setDraftText('');
  };

  const moveTask = (taskId: string, toKey: string) => {
    hapticFeedback.selection();
    setBoard((prev) => {
      let moving: Task | undefined;
      const cleared = prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          if (task.id === taskId) {
            moving = task;
            return false;
          }
          return true;
        }),
      }));
      if (!moving) return prev;
      return cleared.map((column) =>
        column.key === toKey ? { ...column, tasks: [...column.tasks, moving as Task] } : column
      );
    });
    setTaskMenu(null);
  };

  const deleteTask = (taskId: string) => {
    hapticFeedback.medium();
    setBoard((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );
    setTaskMenu(null);
  };

  const deleteResource = (id: string) => {
    hapticFeedback.medium();
    setResources((prev) => prev.filter((resource) => resource.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.textStrong} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {params.name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Options"
          hitSlop={theme.accessibility.hitSlop}
          onPress={hapticFeedback.light}
          style={styles.headerButton}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.textStrong} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.hero}>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          >
            <View style={styles.coverPattern} />
            <View style={[styles.coverPattern, styles.coverPatternTwo]} />
          </LinearGradient>

          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroAvatar}
          >
            <Text style={styles.heroGlyph}>{glyph}</Text>
          </LinearGradient>
          <Text style={styles.heroName}>{params.name}</Text>
          <Text style={styles.heroMeta}>
            {params.members ? `${params.members} membres` : 'Communauté du campus'}
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la discussion"
              onPress={() => {
                hapticFeedback.medium();
                navigation.navigate('Messages', { screen: 'Conversations' });
              }}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <Ionicons name="chatbubbles" size={18} color={theme.colors.white} />
              <Text style={styles.primaryActionText}>Discussion</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Appel de groupe"
              onPress={() => {
                hapticFeedback.medium();
                navigation.navigate('ActiveCall', { name: params.name, callType: 'video' });
              }}
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
            >
              <Ionicons name="videocam" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsBar}>
          <SegmentedTabs items={DETAIL_TABS} activeKey={tab} onChange={setTab} />
        </View>

        <View style={styles.tabBody}>
          {booting ? (
            <ListSkeleton count={5} />
          ) : (
            <>
              {tab === 'about' && (
                <AboutTab
                  description={params.description}
                  projectCount={board.reduce((total, column) => total + column.tasks.length, 0)}
                  resourceCount={resources.length}
                />
              )}
              {tab === 'projects' && (
                <ProjectsTab
                  board={board}
                  onAddTask={(columnKey) => openComposer('task', columnKey)}
                  onTaskPress={(task, columnKey) => {
                    hapticFeedback.selection();
                    setTaskMenu({ task, columnKey });
                  }}
                />
              )}
              {tab === 'resources' && (
                <ResourcesTab
                  resources={resources}
                  onAdd={() => openComposer('resource')}
                  onDelete={deleteResource}
                />
              )}
              {tab === 'members' && <MembersTab />}
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={composer !== null}
        animationType="fade"
        onRequestClose={() => setComposer(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setComposer(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {composer?.mode === 'task' ? 'Nouvelle tâche' : 'Nouvelle ressource'}
            </Text>
            <TextInput
              value={draftText}
              onChangeText={setDraftText}
              autoFocus
              placeholder={composer?.mode === 'task' ? 'Titre de la tâche…' : 'Nom de la ressource…'}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.modalInput}
            />

            {composer?.mode === 'resource' ? (
              <View style={styles.typeRow}>
                {RESOURCE_TYPES.map((item) => {
                  const active = draftType === item.label;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setDraftType(item.label)}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={14}
                        color={active ? theme.colors.white : theme.colors.primary}
                      />
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setComposer(null)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmit, !draftText.trim() && styles.modalSubmitDisabled]}
                disabled={!draftText.trim()}
                onPress={submitComposer}
              >
                <Text style={styles.modalSubmitText}>Ajouter</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={taskMenu !== null}
        animationType="fade"
        onRequestClose={() => setTaskMenu(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTaskMenu(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {taskMenu?.task.title}
            </Text>
            <Text style={styles.modalSubtitle}>Déplacer vers</Text>
            {board
              .filter((column) => column.key !== taskMenu?.columnKey)
              .map((column) => (
                <Pressable
                  key={column.key}
                  style={styles.menuRow}
                  onPress={() => taskMenu && moveTask(taskMenu.task.id, column.key)}
                >
                  <View style={[styles.columnDot, { backgroundColor: column.tint }]} />
                  <Text style={styles.menuRowText}>{column.title}</Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            <Pressable
              style={[styles.menuRow, styles.menuRowDanger]}
              onPress={() => taskMenu && deleteTask(taskMenu.task.id)}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              <Text style={[styles.menuRowText, { color: theme.colors.danger }]}>Supprimer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function AboutTab({
  description,
  projectCount,
  resourceCount,
}: {
  description?: string;
  projectCount: number;
  resourceCount: number;
}) {
  const stats = [
    { label: 'Tâches', value: `${projectCount}`, icon: 'rocket-outline' as const },
    { label: 'Ressources', value: `${resourceCount}`, icon: 'folder-open-outline' as const },
    { label: 'Événements', value: '3', icon: 'calendar-outline' as const },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.paragraph}>
        {description ??
          'Espace collaboratif du campus pour échanger, organiser des projets et partager des ressources académiques.'}
      </Text>
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProjectsTab({
  board,
  onAddTask,
  onTaskPress,
}: {
  board: Column[];
  onAddTask: (columnKey: string) => void;
  onTaskPress: (task: Task, columnKey: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Tableau de projet</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une tâche"
          onPress={() => onAddTask('todo')}
          style={styles.addInline}
        >
          <Ionicons name="add" size={18} color={theme.colors.primary} />
          <Text style={styles.addInlineText}>Tâche</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>
        {board.map((column) => (
          <View key={column.key} style={styles.column}>
            <View style={styles.columnHeader}>
              <View style={[styles.columnDot, { backgroundColor: column.tint }]} />
              <Text style={styles.columnTitle}>{column.title}</Text>
              <Text style={styles.columnCount}>{column.tasks.length}</Text>
            </View>
            {column.tasks.map((task) => (
              <Pressable
                key={task.id}
                accessibilityRole="button"
                accessibilityLabel={`Tâche ${task.title}`}
                onPress={() => onTaskPress(task, column.key)}
                style={({ pressed }) => [styles.taskCard, pressed && styles.pressed]}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskMeta}>
                  <View style={styles.taskAssignee}>
                    <Text style={styles.taskAssigneeText}>{task.assignee[0]}</Text>
                  </View>
                  <View style={styles.taskDue}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                    <Text style={styles.taskDueText}>{task.due}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ajouter une tâche dans ${column.title}`}
              onPress={() => onAddTask(column.key)}
              style={({ pressed }) => [styles.columnAdd, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={16} color={theme.colors.textMuted} />
              <Text style={styles.columnAddText}>Ajouter</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ResourcesTab({
  resources,
  onAdd,
  onDelete,
}: {
  resources: Resource[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Ressources partagées</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une ressource"
          onPress={onAdd}
          style={styles.addInline}
        >
          <Ionicons name="add" size={18} color={theme.colors.primary} />
          <Text style={styles.addInlineText}>Ajouter</Text>
        </Pressable>
      </View>

      {resources.length === 0 ? (
        <View style={styles.resourceEmpty}>
          <Ionicons name="folder-open-outline" size={32} color={theme.colors.textMuted} />
          <Text style={styles.resourceEmptyText}>Aucune ressource. Ajoutez-en une.</Text>
        </View>
      ) : null}

      {resources.map((resource) => (
        <View key={resource.id} style={styles.resourceItem}>
          <View style={styles.resourceIcon}>
            <Ionicons name={resource.icon} size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.resourceCopy}>
            <Text style={styles.resourceTitle} numberOfLines={1}>
              {resource.title}
            </Text>
            <Text style={styles.resourceType}>{resource.type}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Supprimer ${resource.title}`}
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => onDelete(resource.id)}
            style={styles.resourceDelete}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function MembersTab() {
  return (
    <View style={styles.section}>
      {MEMBERS.map((member) => (
        <View key={member.id} style={styles.memberItem}>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.memberAvatar}
          >
            <Text style={styles.memberAvatarText}>{member.name[0]}</Text>
          </LinearGradient>
          <View style={styles.resourceCopy}>
            <Text style={styles.resourceTitle}>{member.name}</Text>
            <Text style={styles.resourceType}>{member.role}</Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.primary} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: theme.navigation.barHeight + theme.spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  cover: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
  },
  coverPattern: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  coverPatternTwo: {
    top: 40,
    right: 90,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroAvatar: {
    width: 92,
    height: 92,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -46,
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
  heroGlyph: {
    color: theme.colors.white,
    fontSize: 36,
    fontWeight: '800',
  },
  heroName: {
    ...theme.typography.title2,
    color: theme.colors.textStrong,
    marginTop: theme.spacing.xs,
  },
  heroMeta: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  primaryActionText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  secondaryAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tabsBar: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  tabBody: {
    paddingTop: theme.spacing.sm,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  paragraph: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  statValue: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  addInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  addInlineText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '700',
  },
  board: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  column: {
    width: 220,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  columnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
    flex: 1,
  },
  columnCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  taskCard: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  taskTitle: {
    ...theme.typography.body,
    color: theme.colors.textStrong,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskAssignee: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskAssigneeText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '800',
  },
  taskDue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taskDueText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  columnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  columnAddText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceCopy: {
    flex: 1,
    gap: 2,
  },
  resourceTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textStrong,
  },
  resourceType: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  resourceDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceEmpty: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xl,
  },
  resourceEmptyText: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.floating,
  },
  modalTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  modalSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
    ...theme.typography.body,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
  },
  typeChipText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: theme.colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  modalCancel: {
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  modalSubmit: {
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  modalSubmitDisabled: {
    opacity: 0.4,
  },
  modalSubmitText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radii.sm,
  },
  menuRowDanger: {
    marginTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  menuRowText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '600',
  },
});
