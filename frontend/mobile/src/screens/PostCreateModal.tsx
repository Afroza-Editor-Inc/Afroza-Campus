import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppButton } from '../components/ui';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

type CreateMode = 'post' | 'story' | 'reel';

type Tool = { key: string; label: string; icon: keyof typeof Ionicons.glyphMap };

const MODE_CONFIG: Record<
  CreateMode,
  { title: string; subtitle: string; prompt: string; cta: string; icon: keyof typeof Ionicons.glyphMap; tools: Tool[] }
> = {
  post: {
    title: 'Nouvelle publication',
    subtitle: 'Partagez une idée, un événement ou une ressource',
    prompt: 'Quoi de neuf sur le campus ?',
    cta: 'Publier maintenant',
    icon: 'create-outline',
    tools: [
      { key: 'image', label: 'Images', icon: 'images-outline' },
      { key: 'video', label: 'Vidéos', icon: 'videocam-outline' },
      { key: 'doc', label: 'Documents', icon: 'document-text-outline' },
      { key: 'hashtag', label: 'Hashtags', icon: 'pricetag-outline' },
      { key: 'mention', label: 'Mentions', icon: 'at-outline' },
    ],
  },
  story: {
    title: 'Nouvelle story',
    subtitle: 'Contenu éphémère visible 24h',
    prompt: 'Ajoutez un texte à votre story',
    cta: 'Partager la story',
    icon: 'aperture-outline',
    tools: [
      { key: 'photo', label: 'Photo', icon: 'camera-outline' },
      { key: 'video', label: 'Vidéo', icon: 'videocam-outline' },
      { key: 'text', label: 'Texte', icon: 'text-outline' },
      { key: 'sticker', label: 'Stickers', icon: 'happy-outline' },
      { key: 'mention', label: 'Mention', icon: 'at-outline' },
      { key: 'location', label: 'Lieu', icon: 'location-outline' },
    ],
  },
  reel: {
    title: 'Nouveau reel',
    subtitle: 'Vidéo courte et immersive',
    prompt: 'Décrivez votre reel',
    cta: 'Publier le reel',
    icon: 'film-outline',
    tools: [
      { key: 'import', label: 'Importer', icon: 'cloud-upload-outline' },
      { key: 'music', label: 'Musique', icon: 'musical-notes-outline' },
      { key: 'text', label: 'Texte', icon: 'text-outline' },
      { key: 'effects', label: 'Effets', icon: 'sparkles-outline' },
      { key: 'filters', label: 'Filtres', icon: 'color-filter-outline' },
      { key: 'cover', label: 'Miniature', icon: 'image-outline' },
    ],
  },
};

export default function PostCreateModal({ navigation, route }: any) {
  const mode: CreateMode = route?.params?.mode ?? 'post';
  const config = MODE_CONFIG[mode] ?? MODE_CONFIG.post;
  const [caption, setCaption] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.goBack()}
          style={styles.close}
        >
          <Ionicons name="close" size={22} color={theme.colors.textStrong} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name={config.icon} size={20} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(240)} style={styles.card}>
          <Text style={styles.cardTitle}>{config.prompt}</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Partagez une idée, un event, une story ou une ressource utile…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            multiline
          />
          <View style={styles.toolRow}>
            {config.tools.map((tool) => (
              <Pressable
                key={tool.key}
                accessibilityRole="button"
                accessibilityLabel={tool.label}
                onPress={() => hapticFeedback.selection()}
                style={({ pressed }) => [styles.toolChip, pressed && styles.pressed]}
              >
                <Ionicons name={tool.icon} size={18} color={theme.colors.primaryDeep} />
                <Text style={styles.toolText}>{tool.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(240)}>
          <Text style={styles.previewLabel}>Aperçu</Text>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.previewVisual}
          >
            <View style={styles.previewTopRow}>
              <Ionicons name={config.icon} size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.previewTop}>Afroza Creator Mode</Text>
            </View>
            <Text style={styles.previewCaption}>
              {caption || 'Votre contenu apparaîtra ici avec une carte média premium prête à publier.'}
            </Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.actions}>
          <AppButton label="Enregistrer le brouillon" variant="secondary" />
          <AppButton
            label={config.cta}
            disabled={!caption.trim()}
            onPress={() => {
              hapticFeedback.strong();
              navigation.goBack();
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.title2,
    color: theme.colors.textStrong,
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  card: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardTitle: {
    ...theme.typography.title3,
    color: theme.colors.textStrong,
  },
  input: {
    minHeight: 140,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.md,
    color: theme.colors.textStrong,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  toolText: {
    ...theme.typography.label,
    color: theme.colors.primaryDeep,
  },
  previewLabel: {
    ...theme.typography.label,
    color: theme.colors.textStrong,
    marginBottom: theme.spacing.sm,
  },
  previewVisual: {
    minHeight: 200,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTop: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  previewCaption: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: theme.colors.white,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
