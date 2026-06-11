import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { useCallsStore } from '../store/callsStore';
import { SuccessState } from '../components/feedback';

type ScheduleParams = {
  ScheduleMeeting: { kind?: 'meeting' | 'conference' } | undefined;
};

const DURATIONS = [15, 30, 45, 60];
const QUICK_SLOTS = ['Maintenant', 'Dans 1h', 'Cet après-midi', 'Demain 9h'];

export default function ScheduleMeetingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<ScheduleParams, 'ScheduleMeeting'>>();
  const kind = route.params?.kind ?? 'meeting';
  const isConference = kind === 'conference';
  const addMeeting = useCallsStore((state) => state.addMeeting);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [duration, setDuration] = React.useState(30);
  const [slot, setSlot] = React.useState(QUICK_SLOTS[0]);
  const [video, setVideo] = React.useState(true);
  const [submitted, setSubmitted] = React.useState(false);

  const slotToDate = (value: string) => {
    const now = Date.now();
    switch (value) {
      case 'Dans 1h':
        return new Date(now + 3600000);
      case 'Cet après-midi':
        return new Date(now + 5 * 3600000);
      case 'Demain 9h':
        return new Date(now + 86400000);
      default:
        return new Date(now);
    }
  };

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) {
      hapticFeedback.error();
      return;
    }
    hapticFeedback.strong();
    const start = slotToDate(slot);
    addMeeting({
      id: `meet_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: start,
      endTime: new Date(start.getTime() + duration * 60000),
      participants: [],
      participantCount: 1,
      meetingLink: `https://meet.afroza.campus/${Date.now().toString(36)}`,
    });
    setSubmitted(true);
    setTimeout(() => navigation.goBack(), 1100);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(260)} style={styles.successWrap}>
          <SuccessState
            icon={isConference ? 'planet' : 'calendar'}
            title={isConference ? 'Conférence lancée' : 'Réunion planifiée'}
            subtitle={
              isConference
                ? 'Votre salle est prête, invitez vos participants.'
                : `« ${title.trim()} » a été ajoutée à vos réunions.`
            }
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + theme.spacing.sm }]}
      >
        <View style={styles.heroPattern} />
        <View style={styles.heroTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => navigation.goBack()}
            style={styles.heroButton}
          >
            <Ionicons name="close" size={22} color={theme.colors.white} />
          </Pressable>
          <View style={styles.heroBadge}>
            <Ionicons name={isConference ? 'planet' : 'calendar'} size={18} color={theme.colors.white} />
          </View>
        </View>
        <Text style={styles.heroEyebrow}>Afroza Campus</Text>
        <Text style={styles.heroTitle}>
          {isConference ? 'Nouvelle conférence' : 'Planifier une réunion'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {isConference
            ? 'Ouvrez une salle vocale ou vidéo pour votre communauté.'
            : 'Choisissez un créneau et invitez vos participants.'}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(60).duration(260)}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={kind === 'conference' ? 'Ex. Conférence Design System' : 'Ex. Sprint planning'}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ordre du jour, objectifs…"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          style={[styles.input, styles.inputMultiline]}
        />

        <Text style={styles.label}>Quand</Text>
        <View style={styles.chipsRow}>
          {QUICK_SLOTS.map((value) => {
            const active = value === slot;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  hapticFeedback.selection();
                  setSlot(value);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Durée</Text>
        <View style={styles.chipsRow}>
          {DURATIONS.map((value) => {
            const active = value === duration;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  hapticFeedback.selection();
                  setDuration(value);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{value} min</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => {
            hapticFeedback.selection();
            setVideo((value) => !value);
          }}
          style={styles.toggleRow}
        >
          <View style={styles.toggleCopy}>
            <Ionicons name="videocam-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.toggleLabel}>Activer la vidéo</Text>
          </View>
          <View style={[styles.switch, video && styles.switchOn]}>
            <View style={[styles.knob, video && styles.knobOn]} />
          </View>
        </Pressable>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer"
          onPress={submit}
          style={({ pressed }) => [
            styles.submit,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
        >
          <Ionicons name="calendar" size={20} color={theme.colors.white} />
          <Text style={styles.submitText}>
            {isConference ? 'Lancer la conférence' : 'Planifier'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.radii.xl,
    borderBottomRightRadius: theme.radii.xl,
    overflow: 'hidden',
  },
  heroPattern: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  heroButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroEyebrow: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: theme.colors.white,
    marginTop: 2,
  },
  heroSubtitle: {
    ...theme.typography.bodyMuted,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxl,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.textStrong,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  toggleCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  toggleLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textStrong,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceStrong,
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: theme.colors.primary,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.white,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
  },
  submitDisabled: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  submitPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
