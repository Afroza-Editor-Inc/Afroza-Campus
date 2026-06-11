import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton, AppScreen, GlassCard, SectionTitle } from '../components/ui';
import theme from '../theme';

export default function CreateScreen({ navigation }: any) {
  return (
    <AppScreen contentContainerStyle={styles.container}>
      <SectionTitle eyebrow="Studio" title="Créer en un geste" />
      <GlassCard style={styles.hero}>
        <Text style={styles.title}>Publications, reels, annonces, fichiers de cours.</Text>
        <Text style={styles.text}>
          Le bouton central ouvre normalement le studio de création. Cet écran sert de fallback si la
          navigation y accède directement.
        </Text>
        <AppButton label="Ouvrir le studio" onPress={() => navigation.navigate('PostCreate')} />
      </GlassCard>
      <View style={styles.options}>
        {['Post campus', 'Story express', 'Annonce club', 'Document PDF'].map((option) => (
          <GlassCard key={option} style={styles.option}>
            <Text style={styles.optionTitle}>{option}</Text>
            <Text style={styles.optionText}>Template prêt à personnaliser pour un workflow de création rapide.</Text>
          </GlassCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 150,
    gap: theme.spacing.lg,
  },
  hero: {
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.title2,
  },
  text: {
    ...theme.typography.bodyMuted,
  },
  options: {
    gap: theme.spacing.md,
  },
  option: {
    gap: theme.spacing.xs,
  },
  optionTitle: {
    ...theme.typography.title3,
  },
  optionText: {
    ...theme.typography.bodyMuted,
  },
});
