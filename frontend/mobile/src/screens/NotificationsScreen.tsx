import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AppScreen, GlassCard } from '../components/ui';
import { EmptyState, ListSkeleton } from '../components/feedback';
import { hapticFeedback } from '../utils/haptics';
import theme from '../theme';

type NotificationType = 'like' | 'message' | 'event' | 'mention';
type NotificationGroup = 'today' | 'yesterday' | 'week';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  time: string;
  group: NotificationGroup;
};

const ICONS: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; tint: string }> = {
  like: { icon: 'heart', tint: theme.colors.danger },
  message: { icon: 'chatbubble-ellipses', tint: theme.colors.primary },
  event: { icon: 'calendar', tint: theme.colors.secondaryDeep },
  mention: { icon: 'at', tint: theme.colors.accent },
};

const GROUP_LABELS: Record<NotificationGroup, string> = {
  today: "Aujourd'hui",
  yesterday: 'Hier',
  week: 'Cette semaine',
};

const GROUP_ORDER: NotificationGroup[] = ['today', 'yesterday', 'week'];

const notifications: NotificationItem[] = [
  { id: '1', type: 'like', title: 'Alicia a aimé votre publication', time: 'à l’instant', group: 'today' },
  { id: '2', type: 'message', title: 'Nouveau message dans Product Builders', time: '12 min', group: 'today' },
  { id: '3', type: 'event', title: 'Hackathon IA confirmé pour vendredi', time: '34 min', group: 'today' },
  { id: '4', type: 'mention', title: 'Le canal Campus News vous mentionne', time: 'hier, 18 h', group: 'yesterday' },
  { id: '5', type: 'like', title: 'Karim et 12 autres ont aimé votre story', time: 'hier, 14 h', group: 'yesterday' },
  { id: '6', type: 'event', title: 'Rappel : atelier UX lundi prochain', time: 'lun.', group: 'week' },
  { id: '7', type: 'message', title: 'Promo L3 : 5 nouveaux messages', time: 'mar.', group: 'week' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const grouped = React.useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        label: GROUP_LABELS[group],
        items: notifications.filter((item) => item.group === group),
      })).filter((section) => section.items.length > 0),
    []
  );

  return (
    <AppScreen scrollable contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.textStrong} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.eyebrow}>Temps réel</Text>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {booting ? (
        <ListSkeleton count={5} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="Aucune notification"
          subtitle="Les likes, messages et mentions de votre campus apparaîtront ici."
        />
      ) : (
        grouped.map((section, sectionIndex) => (
          <View key={section.group} style={styles.section}>
            <Text style={styles.groupTitle}>{section.label}</Text>
            <View style={styles.list}>
              {section.items.map((item, index) => {
                const { icon, tint } = ICONS[item.type];
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInUp.delay(60 + (sectionIndex * 3 + index) * 50)
                      .springify()
                      .damping(16)}
                  >
                    <GlassCard style={styles.card}>
                      <View style={[styles.iconCircle, { backgroundColor: `${tint}1A` }]}>
                        <Ionicons name={icon} size={20} color={tint} />
                      </View>
                      <View style={styles.textWrap}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                      </View>
                    </GlassCard>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 140,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    ...theme.typography.title2,
    fontWeight: '800',
  },
  section: {
    gap: theme.spacing.sm,
  },
  groupTitle: {
    ...theme.typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...theme.typography.body,
  },
  time: {
    ...theme.typography.caption,
  },
});
