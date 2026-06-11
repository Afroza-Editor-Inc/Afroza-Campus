import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'MessagingSettings'>;

export default function MessagingSettingsScreen({ navigation }: Props) {
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
          <Text style={[styles.headerTitle, { color: palette.text }]}>Parametres messagerie</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {(
            [
              ['Notifications', 'Gestion des alertes, sons et apercus', () => navigation.navigate('MessagingSection', { variant: 'notifications' })],
              ['Sauvegarde des medias', 'Visibilite des photos et videos sur l appareil', () => navigation.navigate('MessagingSection', { variant: 'wallpapers' })],
              ['Messages ephemeres', 'Duree par defaut des discussions temporaires', () => navigation.navigate('MessagingSection', { variant: 'disappearing' })],
              ['Confidentialite', 'Blocage, signalement et controles de lecture', () => navigation.navigate('MessagingSection', { variant: 'privacy' })],
              ['Stockage', 'Espace utilise par les medias et conversations', () => navigation.navigate('MessagingSection', { variant: 'storage' })],
            ] as const
          ).map(([title, subtitle, onPress]) => (
            <Pressable
              key={title}
              onPress={onPress}
              style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
                  <Text style={[styles.cardText, { color: palette.textMuted }]}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.textSoft} />
              </View>
            </Pressable>
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
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBody: {
    flex: 1,
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
