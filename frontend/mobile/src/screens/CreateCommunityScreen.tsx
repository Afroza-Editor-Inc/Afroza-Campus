import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { AppButton } from '../components/ui';
import { SuccessState } from '../components/feedback';

type CreateParams = {
  CreateCommunity: { kind?: 'community' | 'group' | 'project' | 'event' } | undefined;
};

const KIND_CONFIG: Record<
  NonNullable<CreateParams['CreateCommunity']>['kind'],
  { title: string; subtitle: string; cta: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  community: { title: 'Nouvelle communauté', subtitle: 'Un espace pour rassembler vos membres', cta: 'Créer la communauté', icon: 'planet-outline' },
  group: { title: 'Nouveau groupe', subtitle: 'Un espace de discussion et de collaboration', cta: 'Créer le groupe', icon: 'people-outline' },
  project: { title: 'Nouveau projet', subtitle: 'Organisez les tâches et les échéances', cta: 'Créer le projet', icon: 'rocket-outline' },
  event: { title: 'Nouvel événement', subtitle: 'Conférence, hackathon, atelier…', cta: 'Créer l’événement', icon: 'calendar-outline' },
};

const CATEGORIES = ['Faculté', 'Club', 'Projet', 'Sport', 'Culture', 'Tech', 'Entraide'];

const BANNERS: Array<readonly [string, string, ...string[]]> = [
  theme.gradients.brand,
  theme.gradients.ocean,
  theme.gradients.mint,
  theme.gradients.aqua,
  [theme.colors.primaryDeep, theme.colors.primary],
];

export default function CreateCommunityScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<CreateParams, 'CreateCommunity'>>();
  const kind = route.params?.kind ?? 'community';
  const config = KIND_CONFIG[kind];

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [bannerIndex, setBannerIndex] = React.useState(0);
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const canSubmit = name.trim().length > 1;

  const submit = () => {
    if (!canSubmit) {
      hapticFeedback.error();
      return;
    }
    hapticFeedback.strong();
    setSubmitted(true);
    setTimeout(() => navigation.goBack(), 1100);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(260)} style={styles.successWrap}>
          <SuccessState icon={config.icon} title="C’est créé !" subtitle={`« ${name.trim()} » est prête. Invitez vos premiers membres.`} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={BANNERS[bannerIndex]}
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
          <Text style={styles.heroTitle}>{config.title}</Text>
          <View style={styles.heroButton} />
        </View>

        <View style={styles.logoPicker}>
          <View style={styles.logoCircle}>
            <Ionicons name={config.icon} size={34} color={theme.colors.white} />
            <Pressable accessibilityRole="button" accessibilityLabel="Changer le logo" onPress={hapticFeedback.light} style={styles.logoEdit}>
              <Ionicons name="camera" size={14} color={theme.colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.heroSubtitle}>{config.subtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(240)}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Club Robotique Afroza"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Présentez l’objectif, les activités…"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={[styles.input, styles.inputMultiline]}
          />

          <Text style={styles.label}>Bannière</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerRow}>
            {BANNERS.map((colors, index) => (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={`Bannière ${index + 1}`}
                onPress={() => {
                  hapticFeedback.selection();
                  setBannerIndex(index);
                }}
                style={[styles.bannerOption, bannerIndex === index && styles.bannerOptionActive]}
              >
                <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bannerSwatch} />
                {bannerIndex === index ? (
                  <View style={styles.bannerCheck}>
                    <Ionicons name="checkmark" size={14} color={theme.colors.white} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    hapticFeedback.selection();
                    setCategory(item);
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Confidentialité</Text>
          <View style={styles.privacyRow}>
            <PrivacyOption
              active={!isPrivate}
              icon="globe-outline"
              title="Publique"
              subtitle="Tout le monde peut rejoindre"
              onPress={() => {
                hapticFeedback.selection();
                setIsPrivate(false);
              }}
            />
            <PrivacyOption
              active={isPrivate}
              icon="lock-closed-outline"
              title="Privée"
              subtitle="Sur invitation uniquement"
              onPress={() => {
                hapticFeedback.selection();
                setIsPrivate(true);
              }}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <AppButton label={config.cta} disabled={!canSubmit} onPress={submit} />
      </View>
    </View>
  );
}

function PrivacyOption({
  active,
  icon,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={active ? { selected: true } : {}}
      accessibilityLabel={title}
      onPress={onPress}
      style={[styles.privacyCard, active && styles.privacyCardActive]}
    >
      <View style={[styles.privacyIcon, active && styles.privacyIconActive]}>
        <Ionicons name={icon} size={20} color={active ? theme.colors.white : theme.colors.primary} />
      </View>
      <Text style={styles.privacyTitle}>{title}</Text>
      <Text style={styles.privacySubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  hero: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
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
  },
  heroButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroTitle: {
    ...theme.typography.title3,
    color: theme.colors.white,
  },
  logoPicker: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEdit: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  heroSubtitle: {
    ...theme.typography.bodyMuted,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing.md,
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
  bannerRow: {
    gap: theme.spacing.sm,
    paddingVertical: 2,
  },
  bannerOption: {
    borderRadius: theme.radii.md,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bannerOptionActive: {
    borderColor: theme.colors.primary,
  },
  bannerSwatch: {
    width: 88,
    height: 52,
    borderRadius: theme.radii.sm,
  },
  bannerCheck: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
  privacyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  privacyCard: {
    flex: 1,
    gap: 4,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  privacyCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  privacyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    marginBottom: 4,
  },
  privacyIconActive: {
    backgroundColor: theme.colors.primary,
  },
  privacyTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  privacySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
});
