import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { useConversation } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'WallpaperPicker'>;

const WALLPAPERS = [
  {
    key: 'lagoon',
    label: 'Lagoon',
    colors: ['rgba(0,114,255,0.18)', 'rgba(0,180,216,0.10)', 'rgba(0,200,150,0.18)'],
  },
  {
    key: 'sunrise',
    label: 'Sunrise',
    colors: ['rgba(255,203,112,0.20)', 'rgba(0,114,255,0.08)', 'rgba(0,200,150,0.16)'],
  },
  {
    key: 'midnight',
    label: 'Midnight',
    colors: ['rgba(7,17,31,0.92)', 'rgba(0,114,255,0.16)', 'rgba(15,23,42,0.92)'],
  },
] as const;

export default function WallpaperPickerScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const palette = useMessagingPalette();
  const conversation = useConversation(conversationId);
  const setConversationWallpaper = useMessagingStore((state) => state.setConversationWallpaper);

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
            <Text style={[styles.headerTitle, { color: palette.text }]}>Fond de discussion</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>
              Selectionnez un rendu plus lisible et plus premium
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {WALLPAPERS.map((wallpaper) => {
            const active = conversation?.wallpaperKey === wallpaper.key;

            return (
              <Pressable
                key={wallpaper.key}
                onPress={() => setConversationWallpaper(conversationId, wallpaper.key)}
                style={[styles.card, { backgroundColor: palette.surface, borderColor: active ? palette.activeStart : palette.border }]}
              >
                <LinearGradient colors={wallpaper.colors} style={styles.preview}>
                  <View style={[styles.sampleBubbleLeft, { backgroundColor: 'rgba(255,255,255,0.88)' }]} />
                  <LinearGradient colors={[messagingGradient[0], messagingGradient[2]]} style={styles.sampleBubbleRight} />
                </LinearGradient>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={[styles.cardTitle, { color: palette.text }]}>{wallpaper.label}</Text>
                    <Text style={[styles.cardMeta, { color: palette.textMuted }]}>
                      Applique a cette discussion uniquement
                    </Text>
                  </View>

                  {active ? (
                    <View style={[styles.activeBadge, { backgroundColor: palette.surfaceStrong }]}>
                      <Ionicons name="checkmark" size={16} color={palette.activeStart} />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
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
  headerBody: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.title3,
  },
  headerSubtitle: {
    ...theme.typography.bodyMuted,
    fontSize: 13,
  },
  content: {
    paddingTop: messagingSpacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: messagingSpacing.md,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  preview: {
    height: 180,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  sampleBubbleLeft: {
    width: '54%',
    height: 52,
    borderRadius: 18,
    borderBottomLeftRadius: 8,
  },
  sampleBubbleRight: {
    width: '62%',
    height: 58,
    borderRadius: 18,
    borderBottomRightRadius: 8,
    alignSelf: 'flex-end',
  },
  cardFooter: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
