import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../theme';

interface ShareOption {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface ShareSheetProps {
  onClose: () => void;
  postId: string;
}

export function ShareSheet({ postId, onClose }: ShareSheetProps) {
  const [actionText, setActionText] = useState('');

  const shareOptions: ShareOption[] = [
    {
      id: 'message',
      label: 'Envoyer en message',
      icon: 'chatbubble-outline',
      onPress: () => {
        setActionText('Partagé via message');
        setTimeout(onClose, 1500);
      },
    },
    {
      id: 'story',
      label: 'Ajouter à la story',
      icon: 'add-circle-outline',
      onPress: () => {
        setActionText('Ajouté à ta story');
        setTimeout(onClose, 1500);
      },
    },
    {
      id: 'copy',
      label: 'Copier le lien',
      icon: 'link-outline',
      onPress: () => {
        setActionText('Lien copié !');
        setTimeout(onClose, 1500);
      },
    },
    {
      id: 'save',
      label: 'Enregistrer le post',
      icon: 'bookmark-outline',
      onPress: () => {
        setActionText('Post enregistré');
        setTimeout(onClose, 1500);
      },
    },
    {
      id: 'more',
      label: 'Plus d\'options',
      icon: 'ellipsis-horizontal',
      onPress: () => {
        console.log('More options');
      },
    },
  ];

  const renderOption = ({ item }: { item: ShareOption }) => (
    <Pressable
      style={styles.optionButton}
      onPress={() => item.onPress()}
    >
      <View style={styles.optionIcon}>
        <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
      </View>
      <Text style={styles.optionLabel}>{item.label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Partager</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Action Feedback */}
        {actionText && (
          <View style={styles.feedback}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.feedbackText}>{actionText}</Text>
          </View>
        )}

        {/* Options Grid */}
        <FlatList
          data={shareOptions}
          renderItem={renderOption}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.optionsContainer}
          scrollEnabled={false}
        />

        {/* Cancel Button */}
        <Pressable
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    margin: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.success,
  },
  optionsContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
  },
  optionIcon: {
    marginBottom: theme.spacing.sm,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  cancelButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
