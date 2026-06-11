import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'MessagingHelp'>;

export default function MessagingHelpScreen({ navigation }: Props) {
  const palette = useMessagingPalette();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.headerButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Aide</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {[
            ['Demarrer une discussion', 'Choisissez un contact puis touchez son nom pour ouvrir le chat.'],
            ['Envoyer un media', 'Utilisez la piece jointe ou la camera depuis la barre de saisie.'],
            ['Bloquer ou signaler', 'Ces actions sont disponibles depuis le profil du contact.'],
            ['Lier un appareil', 'Ouvrez Appareils connectes puis scannez le QR de connexion.'],
          ].map(([title, description]) => (
            <View
              key={title}
              style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
              <Text style={[styles.cardText, { color: palette.textMuted }]}>{description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: theme.spacing.md },
  header: {
    paddingBottom: messagingSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.title3,
    fontWeight: '800',
  },
  headerSpacer: { width: 42 },
  content: { paddingBottom: theme.spacing.xxl, gap: messagingSpacing.sm },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardText: {
    ...theme.typography.bodyMuted,
  },
});
