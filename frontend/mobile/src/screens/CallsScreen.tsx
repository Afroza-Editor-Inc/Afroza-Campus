import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { useCallsStore, type Call, type Meeting } from '../store/callsStore';
import { EmptyState, ListSkeleton } from '../components/feedback';
import ModuleMenu, { type ModuleMenuSection } from '../components/navigation/ModuleMenu';

const AVATAR_TINTS = ['#0072FF', '#00A3FF', '#00C557', '#0456C7', '#13B0C9'] as const;

function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const day = 86400000;
  const time = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (diff < day) return `Aujourd'hui ${time}`;
  if (diff < 2 * day) return `Hier ${time}`;
  return `Il y a ${Math.floor(diff / day)} j`;
}

function upcomingTime(date: Date) {
  const diff = date.getTime() - Date.now();
  if (diff < 0) return 'En cours';
  if (diff < 3600000) return `Dans ${Math.max(1, Math.round(diff / 60000))} min`;
  if (diff < 86400000) return `Aujourd'hui ${date.getHours()}h`;
  return `Demain ${date.getHours()}h`;
}

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function callStatus(call: Call) {
  if (call.type === 'missed') {
    return { label: 'Manqué', tint: theme.colors.danger, icon: 'arrow-down-outline' as const };
  }
  const duration = formatDuration(call.duration);
  if (call.type === 'incoming') {
    return {
      label: duration ? `Entrant · ${duration}` : 'Entrant',
      tint: theme.colors.secondaryDeep,
      icon: 'arrow-down-outline' as const,
    };
  }
  return {
    label: duration ? `Sortant · ${duration}` : 'Sortant',
    tint: theme.colors.primary,
    icon: 'arrow-up-outline' as const,
  };
}

/* -------------------------------------------------------------------------- */
/* FAB speed-dial                                                             */
/* -------------------------------------------------------------------------- */

type FabKey = 'audio' | 'video' | 'meeting' | 'conference';

const FAB_ACTIONS: Array<{ key: FabKey; label: string; icon: keyof typeof Ionicons.glyphMap; tint: string }> = [
  { key: 'audio', label: 'Appel audio', icon: 'call-outline', tint: '#0072FF' },
  { key: 'video', label: 'Appel vidéo', icon: 'videocam-outline', tint: '#00A3FF' },
  { key: 'meeting', label: 'Réunion', icon: 'people-outline', tint: '#00C557' },
  { key: 'conference', label: 'Conférence', icon: 'planet-outline', tint: '#0456C7' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CallsFab({ bottomOffset, onAction }: { bottomOffset: number; onAction: (key: FabKey) => void }) {
  const [open, setOpen] = React.useState(false);
  const rotation = useSharedValue(0);

  const toggle = () => {
    hapticFeedback.medium();
    setOpen((value) => {
      const next = !value;
      rotation.value = withSpring(next ? 1 : 0, { damping: 14, stiffness: 220 });
      return next;
    });
  };

  const close = () => {
    rotation.value = withTiming(0, { duration: 180 });
    setOpen(false);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  return (
    <>
      {open ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(160)} style={styles.fabBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      ) : null}

      <View style={[styles.fabContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
        {open
          ? FAB_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.key}
                entering={SlideInDown.delay(index * 45).springify().damping(15)}
                exiting={FadeOut.duration(120)}
                style={styles.fabActionRow}
              >
                <View style={styles.fabActionLabel}>
                  <Text style={styles.fabActionLabelText}>{action.label}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={() => {
                    hapticFeedback.selection();
                    close();
                    onAction(action.key);
                  }}
                  style={({ pressed }) => [styles.fabAction, { backgroundColor: action.tint }, pressed && styles.pressed]}
                >
                  <Ionicons name={action.icon} size={20} color={theme.colors.white} />
                </Pressable>
              </Animated.View>
            ))
          : null}

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'Fermer' : 'Nouvel appel'}
          onPress={toggle}
          style={styles.fab}
        >
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={iconStyle}>
            <Ionicons name="add" size={28} color={theme.colors.white} />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer                                                                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Quick actions                                                              */
/* -------------------------------------------------------------------------- */

const QUICK_ACTIONS: Array<{
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string, ...string[]];
}> = [
  { key: 'audio', label: 'Appel\naudio', icon: 'call', colors: theme.gradients.ocean },
  { key: 'video', label: 'Appel\nvidéo', icon: 'videocam', colors: theme.gradients.mint },
  { key: 'meeting', label: 'Nouvelle\nréunion', icon: 'people', colors: theme.gradients.aqua },
  { key: 'conference', label: 'Nouvelle\nconférence', icon: 'planet', colors: [theme.colors.primaryDeep, theme.colors.primary] as const },
  { key: 'schedule', label: 'Planifier\nréunion', icon: 'calendar', colors: [theme.colors.accent, theme.colors.secondary] as const },
];

const CONFERENCE_SPACES = [
  { id: 'c1', title: 'Espace vocal — Dev', members: 8, icon: 'mic-outline' as const },
  { id: 'c2', title: 'Amphi virtuel — Maths', members: 42, icon: 'easel-outline' as const },
  { id: 'c3', title: 'Salle projet — Design', members: 5, icon: 'color-palette-outline' as const },
];

const ACTIVITIES: Array<{ id: string; icon: keyof typeof Ionicons.glyphMap; tint: string; title: string; time: string }> = [
  { id: 'a1', icon: 'videocam', tint: '#00A3FF', title: 'Réunion Projet IA terminée', time: 'Il y a 2 h' },
  { id: 'a2', icon: 'call', tint: '#00C557', title: 'Appel avec Alice Dupont', time: 'Hier' },
  { id: 'a3', icon: 'mail-open-outline', tint: '#0072FF', title: 'Invitation reçue — Club Lecture', time: 'Hier' },
  { id: 'a4', icon: 'planet', tint: '#0456C7', title: 'Conférence Design rejointe', time: 'Lun.' },
];

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

function UpcomingMeetingCard({ meeting, onJoin, onSchedule }: { meeting: Meeting; onJoin: () => void; onSchedule: () => void }) {
  return (
    <View style={styles.meetingCard}>
      <View style={styles.meetingTop}>
        <View style={styles.meetingTimeBox}>
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.meetingTimeText}>{upcomingTime(meeting.startTime)}</Text>
        </View>
        <View style={styles.meetingStatusBadge}>
          <Text style={styles.meetingStatusText}>Programmée</Text>
        </View>
      </View>
      <Text style={styles.meetingTitle} numberOfLines={1}>{meeting.title}</Text>
      {meeting.description ? <Text style={styles.itemMeta} numberOfLines={1}>{meeting.description}</Text> : null}
      <View style={styles.meetingFooter}>
        <View style={styles.meetingAvatars}>
          {meeting.participants.slice(0, 3).map((participant, index) => (
            <View
              key={participant}
              style={[styles.meetingAvatar, { backgroundColor: tintFor(participant), marginLeft: index === 0 ? 0 : -10 }]}
            >
              <Text style={styles.meetingAvatarText}>{participant.slice(-1)}</Text>
            </View>
          ))}
          <Text style={styles.meetingCount}>{meeting.participantCount} participants</Text>
        </View>
        <View style={styles.meetingActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Modifier" onPress={onSchedule} style={styles.meetingGhostButton}>
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Rejoindre ${meeting.title}`} onPress={onJoin} style={styles.meetingJoinButton}>
            <Text style={styles.meetingJoinText}>Rejoindre</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

export default function CallsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const calls = useCallsStore((state) => state.calls);
  const meetings = useCallsStore((state) => state.meetings);
  const [query, setQuery] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const favorites = React.useMemo(() => {
    const seen = new Set<string>();
    return calls
      .filter((call) => {
        if (seen.has(call.participantName)) return false;
        seen.add(call.participantName);
        return true;
      })
      .slice(0, 6);
  }, [calls]);

  const filteredCalls = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return calls;
    return calls.filter((call) => call.participantName.toLowerCase().includes(q));
  }, [calls, query]);

  const startCall = (callType: 'voice' | 'video', name = 'Nouvel appel', mode?: 'conference') => {
    hapticFeedback.medium();
    navigation.navigate('ActiveCall', { name, callType, mode });
  };

  const handleQuickAction = (key: string) => {
    hapticFeedback.medium();
    switch (key) {
      case 'audio':
        navigation.navigate('ActiveCall', { name: 'Nouvel appel', callType: 'voice' });
        break;
      case 'video':
        navigation.navigate('ActiveCall', { name: 'Nouvel appel', callType: 'video' });
        break;
      case 'meeting':
        navigation.navigate('ActiveCall', { name: 'Réunion instantanée', callType: 'video', mode: 'conference' });
        break;
      case 'conference':
        navigation.navigate('ScheduleMeeting', { kind: 'conference' });
        break;
      case 'schedule':
        navigation.navigate('ScheduleMeeting', { kind: 'meeting' });
        break;
    }
  };

  const handleFabAction = (key: FabKey) => {
    switch (key) {
      case 'audio':
        startCall('voice');
        break;
      case 'video':
        startCall('video');
        break;
      case 'meeting':
        startCall('video', 'Réunion instantanée', 'conference');
        break;
      case 'conference':
        navigation.navigate('ScheduleMeeting', { kind: 'conference' });
        break;
    }
  };

  const menuSections: ModuleMenuSection[] = React.useMemo(
    () => [
      {
        title: 'Communication',
        items: [
          { key: 'history', label: 'Historique', icon: 'time-outline', onPress: () => navigation.navigate('ScheduleMeeting', { kind: 'meeting' }) },
          { key: 'meetings', label: 'Réunions programmées', icon: 'calendar-outline', onPress: () => navigation.navigate('ScheduleMeeting', { kind: 'meeting' }) },
          { key: 'conferences', label: 'Conférences', icon: 'planet-outline', onPress: () => navigation.navigate('ScheduleMeeting', { kind: 'conference' }) },
        ],
      },
      {
        title: 'Préférences',
        items: [
          { key: 'settings', label: 'Paramètres appels', icon: 'settings-outline', onPress: () => navigation.navigate('Settings') },
          { key: 'audio', label: 'Appareils audio', icon: 'headset-outline', onPress: () => navigation.navigate('Settings') },
          { key: 'video', label: 'Qualité vidéo', icon: 'videocam-outline', onPress: () => navigation.navigate('Settings') },
        ],
      },
    ],
    [navigation]
  );

  const handleLogout = React.useCallback(() => {
    navigation.navigate('Welcome');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerLogo}>
          <Text style={styles.headerLogoText}>A</Text>
        </LinearGradient>
        <Text style={styles.headerTitle}>APPELS</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.selection();
              navigation.navigate('Notifications');
            }}
            style={styles.headerIconButton}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.textStrong} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Menu appels"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => {
              hapticFeedback.selection();
              setMenuVisible(true);
            }}
            style={styles.headerIconButton}
          >
            <Ionicons name="menu-outline" size={22} color={theme.colors.textStrong} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un contact, une réunion…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
        {query.length > 0 ? (
          <Pressable hitSlop={theme.accessibility.hitSlop} onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {booting ? (
        <View style={styles.skeletonWrap}>
          <ListSkeleton count={6} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: theme.navigation.barHeight + 90 }]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View key={action.key} entering={FadeInDown.delay(index * 50).duration(220)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.label.replace('\n', ' ')}
                  onPress={() => handleQuickAction(action.key)}
                  style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
                >
                  <LinearGradient colors={action.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickTileIcon}>
                    <Ionicons name={action.icon} size={24} color={theme.colors.white} />
                  </LinearGradient>
                  <Text style={styles.quickTileLabel}>{action.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          {favorites.length > 0 && query.length === 0 ? (
            <View>
              <SectionHeader title="Favoris" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesRow}>
                {favorites.map((fav) => (
                  <Pressable
                    key={fav.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Appeler ${fav.participantName}`}
                    onPress={() => startCall(fav.callType, fav.participantName)}
                    style={({ pressed }) => [styles.favoriteItem, pressed && styles.pressed]}
                  >
                    <View style={[styles.favoriteAvatar, { backgroundColor: tintFor(fav.participantName) }]}>
                      <Text style={styles.favoriteInitials}>{initials(fav.participantName)}</Text>
                    </View>
                    <Text style={styles.favoriteName} numberOfLines={1}>
                      {fav.participantName.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {query.length === 0 ? (
            <View>
              <SectionHeader title="Réunions à venir" actionLabel="Planifier" onAction={() => navigation.navigate('ScheduleMeeting', { kind: 'meeting' })} />
              {meetings.length === 0 ? (
                <EmptyState icon="calendar-outline" title="Aucune réunion" subtitle="Planifiez votre première réunion." />
              ) : (
                meetings.map((meeting) => (
                  <UpcomingMeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onJoin={() => navigation.navigate('ActiveCall', { name: meeting.title, callType: 'video', mode: meeting.participantCount > 2 ? 'conference' : 'direct' })}
                    onSchedule={() => navigation.navigate('ScheduleMeeting', { kind: 'meeting' })}
                  />
                ))
              )}
            </View>
          ) : null}

          {query.length === 0 ? (
            <View>
              <SectionHeader title="Conférences en direct" />
              {CONFERENCE_SPACES.map((space) => (
                <Pressable
                  key={space.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Rejoindre ${space.title}`}
                  onPress={() => startCall('voice', space.title, 'conference')}
                  style={({ pressed }) => [styles.spaceItem, pressed && styles.pressed]}
                >
                  <View style={styles.spaceIcon}>
                    <Ionicons name={space.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{space.title}</Text>
                    <Text style={styles.itemMeta}>{space.members} en ligne</Text>
                  </View>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View>
            <SectionHeader title={query.length > 0 ? 'Résultats' : 'Appels récents'} />
            {filteredCalls.length === 0 ? (
              <EmptyState icon="call-outline" title="Aucun appel" subtitle={query.length > 0 ? 'Aucun contact ne correspond.' : 'Vos appels récents apparaîtront ici.'} />
            ) : (
              filteredCalls.map((call) => {
                const status = callStatus(call);
                return (
                  <Pressable
                    key={call.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Rappeler ${call.participantName}`}
                    onPress={() => startCall(call.callType, call.participantName)}
                    style={({ pressed }) => [styles.callItem, pressed && styles.pressed]}
                  >
                    <View style={[styles.callAvatar, { backgroundColor: tintFor(call.participantName) }]}>
                      <Text style={styles.favoriteInitials}>{initials(call.participantName)}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.itemTitle, call.type === 'missed' && { color: theme.colors.danger }]} numberOfLines={1}>
                        {call.participantName}
                      </Text>
                      <View style={styles.callMetaRow}>
                        <Ionicons name={status.icon} size={13} color={status.tint} />
                        <Text style={styles.itemMeta}>{status.label} · {relativeTime(call.timestamp)}</Text>
                      </View>
                    </View>
                    <View style={styles.callActionIcon}>
                      <Ionicons name={call.callType === 'video' ? 'videocam' : 'call'} size={20} color={theme.colors.primary} />
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          {query.length === 0 ? (
            <View>
              <SectionHeader title="Activité" />
              <View style={styles.timeline}>
                {ACTIVITIES.map((activity, index) => (
                  <View key={activity.id} style={styles.timelineRow}>
                    <View style={styles.timelineLineWrap}>
                      <View style={[styles.timelineDot, { backgroundColor: activity.tint }]}>
                        <Ionicons name={activity.icon} size={14} color={theme.colors.white} />
                      </View>
                      {index !== ACTIVITIES.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{activity.title}</Text>
                      <Text style={styles.itemMeta}>{activity.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}

      <CallsFab bottomOffset={theme.navigation.barHeight - 18} onAction={handleFabAction} />

      <ModuleMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        moduleLabel="Appels"
        moduleIcon="call-outline"
        sections={menuSections}
        onLogout={handleLogout}
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    color: theme.colors.textStrong,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textStrong,
    paddingVertical: 0,
  },

  /* Scroll & sections */
  skeletonWrap: {
    paddingHorizontal: theme.spacing.md,
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

  /* Quick actions */
  quickRow: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  quickTile: {
    width: 92,
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  quickTileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTileLabel: {
    ...theme.typography.caption,
    color: theme.colors.textStrong,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* Favorites */
  favoritesRow: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  favoriteItem: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  favoriteAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteInitials: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
  },
  favoriteName: {
    ...theme.typography.caption,
    color: theme.colors.textStrong,
    fontWeight: '600',
  },

  /* Meeting card */
  meetingCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    gap: 6,
    ...theme.shadows.card,
  },
  meetingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meetingTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meetingTimeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  meetingStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
  },
  meetingStatusText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDeep,
    fontWeight: '700',
    fontSize: 11,
  },
  meetingTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  meetingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  meetingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  meetingAvatarText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  meetingCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  meetingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  meetingGhostButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  meetingJoinButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  meetingJoinText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },

  /* Conference spaces */
  spaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  spaceIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.danger,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
  },
  liveText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Call item */
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  callAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  itemMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  callMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  callActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Timeline */
  timeline: {
    paddingLeft: theme.spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timelineLineWrap: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  timelineTitle: {
    ...theme.typography.body,
    color: theme.colors.textStrong,
    fontWeight: '600',
  },

  /* FAB */
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 18, 38, 0.35)',
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  fabActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fabActionLabel: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  fabActionLabelText: {
    ...theme.typography.caption,
    color: theme.colors.textStrong,
    fontWeight: '700',
  },
  fabAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadows.floating,
  },

  /* Drawer */
  drawerRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#08122680',
  },
  drawerPanel: {
    width: 320,
    height: '100%',
    backgroundColor: theme.colors.background,
    ...theme.shadows.floating,
  },
  drawerHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  drawerHeaderPattern: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  drawerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  drawerAvatarText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 22,
  },
  drawerHeaderText: {
    flex: 1,
  },
  drawerName: {
    ...theme.typography.title3,
    color: theme.colors.white,
  },
  drawerHandle: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  drawerScroll: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  drawerSection: {
    gap: 4,
  },
  drawerSectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: theme.spacing.xs,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  drawerItemPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  drawerItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  drawerItemLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textStrong,
    fontWeight: '600',
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  drawerLogoutText: {
    ...theme.typography.body,
    color: theme.colors.danger,
    fontWeight: '700',
  },
});
