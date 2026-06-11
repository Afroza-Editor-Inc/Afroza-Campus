import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AppButton } from '../../components/ui';
import { AuthHeading } from '../../components/auth/AuthKit';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

type PermissionItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: readonly [string, string];
};

const PERMISSIONS: PermissionItem[] = [
  {
    key: 'notifications',
    icon: 'notifications-outline',
    title: 'Notifications',
    description: 'Messages, mentions et rappels de réunions en temps réel.',
    colors: theme.gradients.ocean,
  },
  {
    key: 'contacts',
    icon: 'people-outline',
    title: 'Contacts',
    description: 'Retrouvez vos camarades déjà présents sur Afroza Campus.',
    colors: theme.gradients.mint,
  },
  {
    key: 'camera',
    icon: 'videocam-outline',
    title: 'Caméra & micro',
    description: 'Stories, reels et appels vidéo avec votre communauté.',
    colors: theme.gradients.aqua,
  },
];

export default function PermissionsScreen({ navigation }: any) {
  const [granted, setGranted] = React.useState<string[]>([]);

  const toggle = (key: string) => {
    hapticFeedback.selection();
    setGranted((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const finish = () => {
    hapticFeedback.strong();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AuthHeading
          title="Autorisations"
          subtitle="Activez l’essentiel pour profiter pleinement d’Afroza Campus. Vous pourrez les modifier à tout moment dans les réglages."
        />

        <View style={styles.list}>
          {PERMISSIONS.map((item, index) => {
            const isGranted = granted.includes(item.key);
            return (
              <Animated.View key={item.key} entering={FadeInUp.delay(80 + index * 80).springify().damping(16)}>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isGranted }}
                  accessibilityLabel={`${item.title} : ${isGranted ? 'autorisé' : 'non autorisé'}`}
                  onPress={() => toggle(item.key)}
                  style={({ pressed }) => [
                    styles.card,
                    isGranted && styles.cardActive,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <LinearGradient
                    colors={item.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconWrap}
                  >
                    <Ionicons name={item.icon} size={24} color={theme.colors.white} />
                  </LinearGradient>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  <View style={[styles.check, isGranted && styles.checkActive]}>
                    {isGranted ? (
                      <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                    ) : null}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <AppButton
            label={granted.length === PERMISSIONS.length ? 'Continuer' : 'Tout autoriser'}
            onPress={() => {
              if (granted.length === PERMISSIONS.length) {
                finish();
              } else {
                hapticFeedback.medium();
                setGranted(PERMISSIONS.map((item) => item.key));
              }
            }}
          />
          <Pressable hitSlop={theme.accessibility.hitSlop} onPress={finish} style={styles.skip}>
            <Text style={styles.skipText}>Plus tard</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
    flexGrow: 1,
  },
  list: {
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  cardDescription: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  footer: {
    marginTop: 'auto',
    gap: theme.spacing.md,
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
  },
  skipText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
});
