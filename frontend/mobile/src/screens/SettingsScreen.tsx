import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, GlassCard, SectionTitle } from '../components/ui';
import theme from '../theme';

const sections = [
  { title: 'Notifications push', value: true },
  { title: 'Sécurité 2FA', value: false },
  { title: 'Téléchargement auto médias', value: true },
  { title: 'Mode créateur', value: true },
];

export default function SettingsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <SectionTitle eyebrow="Préférences" title="Paramètres" />
        </View>

        <GlassCard style={styles.card}>
          {sections.map((item) => (
            <View key={item.title} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>Configuration mobile-first prête pour la prod.</Text>
              </View>
              <Switch value={item.value} trackColor={{ true: theme.colors.secondary, false: theme.colors.borderStrong }} />
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.rowTitle}>Confidentialité & compte</Text>
          <Text style={styles.link}>Gérer les appareils connectés</Text>
          <Text style={styles.link}>Préférences de visibilité du profil</Text>
          <Text style={styles.link}>Exporter les données</Text>
        </GlassCard>

        <AppButton label="Se déconnecter" variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    gap: theme.spacing.md,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  card: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    ...theme.typography.title3,
    fontSize: 16,
  },
  rowSubtitle: {
    ...theme.typography.bodyMuted,
  },
  link: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
});
