import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';
import type { WallpaperKey } from '../types';

type Props = NativeStackScreenProps<MessagingStackParamList, 'MessagingSection'>;

const WALLPAPER_OPTIONS: Array<{
  key: WallpaperKey;
  label: string;
  colors: [string, string, string];
}> = [
  {
    key: 'lagoon',
    label: 'Lagoon',
    colors: ['rgba(26,115,232,0.22)', 'rgba(0,180,216,0.12)', 'rgba(0,200,150,0.18)'],
  },
  {
    key: 'sunrise',
    label: 'Sunrise',
    colors: ['rgba(255,196,0,0.18)', 'rgba(26,115,232,0.09)', 'rgba(0,200,150,0.15)'],
  },
  {
    key: 'midnight',
    label: 'Midnight',
    colors: ['rgba(8,16,31,0.94)', 'rgba(26,115,232,0.18)', 'rgba(20,38,66,0.94)'],
  },
] as const;

const SECTION_COPY = {
  notifications: {
    title: 'Notifications',
    subtitle: 'Sons, vibration et apercus pour rester alerte sans friction.',
    cards: [
      ['Alertes conversation', 'Activees pour toutes les discussions prioritaires'],
      ['Apercu des messages', 'Affichage discret sur ecran verrouille et centre de notifications'],
      ['Sonnerie appels Afroza', 'Profil sonore campus reconnaissable et non agressif'],
    ],
  },
  storage: {
    title: 'Stockage',
    subtitle: 'Controle des medias pour garder l application legere et rapide.',
    cards: [
      ['Telechargement automatique', 'Wi-Fi recommande pour photos, vocaux et documents lourds'],
      ['Cache intelligent', 'Nettoyage des apercus et medias temporaires en un geste'],
      ['Optimisation reseau lent', 'Compression prioritaire sur reseaux mobiles instables'],
    ],
  },
  locked: {
    title: 'Discussions verrouillees',
    subtitle: 'Protegez les echanges sensibles sans casser la rapidite d acces.',
    cards: [
      ['Verrouillage biometrie', 'Ouverture par empreinte ou Face ID selon l appareil'],
      ['Masquage des apercus', 'Le contenu reste discret avant authentification'],
      ['Filtre discussions', 'Les conversations protegees restent separables du flux principal'],
    ],
  },
  disappearing: {
    title: 'Messages ephemeres',
    subtitle: 'Definir un comportement temporaire propre et previsible pour le module.',
    cards: [
      ['24 heures', 'Ideal pour les messages rapides et les confirmations de cours'],
      ['7 jours', 'Pratique pour les sprints, TD ou discussions projet'],
      ['90 jours', 'Conserve la memoire utile sans surcharger les conversations'],
    ],
  },
  privacy: {
    title: 'Confidentialite avancee',
    subtitle: 'Mieux controler la visibilite des statuts, lectures et informations personnelles.',
    cards: [
      ['Presence et derniere activite', 'Choix fin entre tout le monde, contacts ou personne'],
      ['Confirmations de lecture', 'Possibilite de les garder actives uniquement sur les discussions importantes'],
      ['Protection des medias', 'Limiter l export et la visibilite locale sur l appareil'],
    ],
  },
  wallpapers: {
    title: 'Fonds de discussion',
    subtitle: 'Definir la signature visuelle par defaut des nouvelles conversations Afroza.',
    cards: [],
  },
  report: {
    title: 'Signaler un probleme',
    subtitle: 'Rendre la remontée de bug simple, rapide et bien contextualisee.',
    cards: [
      ['Problemes UI/UX', 'Capturez les ecrans mal alignes, coupes ou peu lisibles'],
      ['Performance', 'Lenteurs, scroll saccade ou transitions moins fluides que prevu'],
      ['Messagerie temps reel', 'Retards, reactions manquantes, medias non synchronises'],
    ],
  },
} as const;

export default function MessagingSectionScreen({ route, navigation }: Props) {
  const { variant } = route.params;
  const palette = useMessagingPalette();
  const defaultWallpaperKey = useMessagingStore((state) => state.ui.defaultWallpaperKey);
  const setDefaultWallpaperKey = useMessagingStore((state) => state.setDefaultWallpaperKey);
  const lockedConversations = useMessagingStore((state) =>
    state.conversations.filter((conversation) => conversation.lockEnabled)
  );
  const section = SECTION_COPY[variant];

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
          <View style={styles.headerBody}>
            <Text style={[styles.headerTitle, { color: palette.text }]}>{section.title}</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>{section.subtitle}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient colors={['rgba(26,115,232,0.14)', 'rgba(0,200,150,0.12)']} style={styles.hero}>
            <Text style={styles.heroTitle}>{section.title}</Text>
            <Text style={styles.heroText}>{section.subtitle}</Text>
          </LinearGradient>

          {variant === 'wallpapers' ? (
            <View style={styles.cardsWrap}>
              {WALLPAPER_OPTIONS.map((option) => {
                const active = defaultWallpaperKey === option.key;

                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setDefaultWallpaperKey(option.key)}
                    style={[
                      styles.wallpaperCard,
                      { backgroundColor: palette.surface, borderColor: active ? palette.activeStart : palette.border },
                    ]}
                  >
                    <LinearGradient colors={option.colors} style={styles.wallpaperPreview}>
                      <View style={[styles.previewBubbleLeft, { backgroundColor: 'rgba(255,255,255,0.84)' }]} />
                      <LinearGradient colors={[messagingGradient[0], messagingGradient[2]]} style={styles.previewBubbleRight} />
                    </LinearGradient>
                    <View style={styles.wallpaperFooter}>
                      <Text style={[styles.cardTitle, { color: palette.text }]}>{option.label}</Text>
                      {active ? <Ionicons name="checkmark-circle" size={20} color={palette.activeStart} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : variant === 'locked' ? (
            <View style={styles.cardsWrap}>
              {section.cards.map(([title, text]) => (
                <View key={title} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
                  <Text style={[styles.cardText, { color: palette.textMuted }]}>{text}</Text>
                </View>
              ))}

              <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Text style={[styles.cardTitle, { color: palette.text }]}>Conversations actuellement verrouillees</Text>
                <Text style={[styles.cardText, { color: palette.textMuted }]}>
                  {lockedConversations.length > 0
                    ? lockedConversations.map((conversation) => conversation.title).join(', ')
                    : 'Aucune conversation verrouillee pour le moment.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.cardsWrap}>
              {section.cards.map(([title, text]) => (
                <View key={title} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
                  <Text style={[styles.cardText, { color: palette.textMuted }]}>{text}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: theme.spacing.md },
  header: {
    paddingBottom: messagingSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: { flex: 1 },
  headerTitle: {
    ...theme.typography.title3,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    gap: messagingSpacing.md,
  },
  hero: {
    borderRadius: 28,
    padding: theme.spacing.lg,
    gap: 6,
  },
  heroTitle: {
    ...theme.typography.title2,
    color: theme.colors.white,
  },
  heroText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.78)',
  },
  cardsWrap: {
    gap: messagingSpacing.sm,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  wallpaperCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  wallpaperPreview: {
    height: 148,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  previewBubbleLeft: {
    width: '52%',
    height: 44,
    borderRadius: 16,
    borderBottomLeftRadius: 8,
  },
  previewBubbleRight: {
    width: '60%',
    height: 52,
    borderRadius: 18,
    borderBottomRightRadius: 8,
    alignSelf: 'flex-end',
  },
  wallpaperFooter: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
