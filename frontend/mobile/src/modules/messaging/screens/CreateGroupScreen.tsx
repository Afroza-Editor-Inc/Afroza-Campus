import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { Avatar } from '../components';
import { useFilteredContacts } from '../hooks/useMessagingSelectors';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';

type Props = NativeStackScreenProps<MessagingStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen({ navigation }: Props) {
  const [title, setTitle] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [avatarUri, setAvatarUri] = React.useState<string | undefined>();
  const contacts = useFilteredContacts({ query, afrozaOnly: true });
  const createGroupConversation = useMessagingStore((state) => state.createGroupConversation);

  const toggleContact = React.useCallback((contactId: string) => {
    setSelectedIds((current) =>
      current.includes(contactId)
        ? current.filter((item) => item !== contactId)
        : [...current, contactId]
    );
  }, []);

  const pickGroupImage = React.useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez la galerie pour choisir une image de groupe.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleCreateGroup = React.useCallback(() => {
    if (!title.trim() || selectedIds.length === 0) {
      Alert.alert('Informations manquantes', 'Ajoutez un nom et au moins un membre.');
      return;
    }

    const conversationId = createGroupConversation({
      title,
      participantIds: selectedIds,
      avatar: avatarUri,
    });

    navigation.replace('Chat', { conversationId });
  }, [avatarUri, createGroupConversation, navigation, selectedIds, title]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Creer un groupe</Text>
          <Pressable onPress={handleCreateGroup} style={styles.headerAction}>
            <Text style={styles.headerActionText}>Creer</Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          <Pressable onPress={pickGroupImage} style={styles.avatarPicker}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="camera" size={24} color={theme.colors.primary} />
                <Text style={styles.avatarHint}>Image groupe</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.formBody}>
            <Text style={styles.label}>Nom groupe</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Core Messaging Squad"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <View style={styles.inlineMeta}>
              <Text style={styles.inlineMetaText}>{selectedIds.length} membre(s)</Text>
              <Text style={styles.inlineMetaText}>Expo Go compatible</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchShell}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrer les membres"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item }) => {
            const selected = selectedIds.includes(item.id);

            return (
              <Pressable
                onPress={() => toggleContact(item.id)}
                style={[styles.contactRow, selected && styles.contactRowSelected]}
              >
                <Avatar
                  label={item.name}
                  uri={item.avatar}
                  color={item.avatarColor}
                  kind="direct"
                  online={item.isOnline}
                />
                <View style={styles.contactText}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactMeta}>{item.roleLabel}</Text>
                </View>
                <View style={[styles.checkWrap, selected && styles.checkWrapSelected]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.title3,
  },
  headerAction: {
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  formCard: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  avatarPicker: {
    width: 92,
    height: 92,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceStrong,
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  avatarHint: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontSize: 11,
  },
  formBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    ...theme.typography.label,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  inlineMetaText: {
    ...theme.typography.bodyMuted,
    fontSize: 12,
  },
  searchShell: {
    marginTop: theme.spacing.lg,
    minHeight: 54,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
  },
  listContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  contactRow: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  contactRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  contactText: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    ...theme.typography.title3,
    fontSize: 16,
  },
  contactMeta: {
    ...theme.typography.bodyMuted,
    fontSize: 13,
  },
  checkWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  checkWrapSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

