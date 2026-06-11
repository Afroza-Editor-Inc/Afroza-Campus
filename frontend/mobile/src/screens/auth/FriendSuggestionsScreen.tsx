import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui';
import { AuthHeading } from '../../components/auth/AuthKit';
import { AuthSteps } from '../../components/auth/AuthSteps';
import theme from '../../theme';

type Suggestion = {
  id: string;
  name: string;
  meta: string;
  color: string;
};

type Section = {
  title: string;
  people: Suggestion[];
};

const SECTIONS: Section[] = [
  {
    title: 'Camarades de filière',
    people: [
      { id: 'p1', name: 'Awa Diop', meta: 'Génie logiciel · L3', color: '#0072FF' },
      { id: 'p2', name: 'Sékou Traoré', meta: 'Génie logiciel · L3', color: '#00C557' },
      { id: 'p3', name: 'Lina Cohen', meta: 'Génie logiciel · L2', color: '#00A3FF' },
    ],
  },
  {
    title: 'Camarades d’établissement',
    people: [
      { id: 'p4', name: 'Moussa Camara', meta: 'UCAD · Réseaux', color: '#00A3FF' },
      { id: 'p5', name: 'Fatou Ndiaye', meta: 'UCAD · Marketing', color: '#0456C7' },
    ],
  },
  {
    title: 'Étudiants recommandés',
    people: [
      { id: 'p6', name: 'Tom Bernard', meta: 'Club Robotique', color: '#13B0C9' },
      { id: 'p7', name: 'Aïcha Bah', meta: 'BDE · Communication', color: '#00C557' },
    ],
  },
  {
    title: 'Depuis vos contacts',
    people: [
      { id: 'p8', name: 'Ibrahima Sow', meta: 'Dans vos contacts', color: '#00FF6A' },
      { id: 'p9', name: 'Mariam Koné', meta: 'Dans vos contacts', color: '#0456C7' },
    ],
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function FriendSuggestionsScreen({ navigation }: any) {
  const [following, setFollowing] = React.useState<string[]>([]);

  const toggle = (id: string) =>
    setFollowing((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const finish = () => navigation.navigate('Permissions');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <AuthSteps total={3} current={3} />
          <Pressable hitSlop={theme.accessibility.hitSlop} onPress={finish}>
            <Text style={styles.skip}>Passer</Text>
          </Pressable>
        </View>

        <AuthHeading
          title="Suivez vos premiers contacts"
          subtitle="Construisez votre réseau campus dès maintenant."
        />

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.people.map((person) => {
              const isFollowing = following.includes(person.id);
              return (
                <View key={person.id} style={styles.personRow}>
                  <View style={[styles.avatar, { backgroundColor: person.color }]}>
                    <Text style={styles.avatarText}>{initials(person.name)}</Text>
                  </View>
                  <View style={styles.personText}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personMeta}>{person.meta}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => toggle(person.id)}
                    style={[styles.followButton, isFollowing && styles.followingButton]}
                  >
                    <Text style={[styles.followText, isFollowing && styles.followingText]}>
                      {isFollowing ? 'Suivi' : 'Suivre'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}

        <AppButton
          label={following.length > 0 ? `Terminer (${following.length})` : 'Terminer'}
          onPress={finish}
        />
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
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  skip: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.title3,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  personText: {
    flex: 1,
    gap: 2,
  },
  personName: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  personMeta: {
    ...theme.typography.bodyMuted,
  },
  followButton: {
    minWidth: 88,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  followText: {
    ...theme.typography.label,
    color: theme.colors.white,
  },
  followingText: {
    color: theme.colors.text,
  },
});
