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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../../theme';
import { useMessagesStore } from '../../../store/messagesStore';
import MessagingAvatar from '../components/MessagingAvatar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MessagesStackParamList } from '../navigation/MessagesNavigator';

type Props = NativeStackScreenProps<MessagesStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen({ navigation }: Props) {
  const contacts = useMessagesStore((state) => state.contacts.filter((contact) => contact.isOnAfroza));
  const createGroupConversation = useMessagesStore((state) => state.createGroupConversation);
  const [title, setTitle] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [avatarUri, setAvatarUri] = React.useState<string | undefined>();

  const toggleContact = (contactId: string) => {
    setSelectedIds((current) =>
      current.includes(contactId)
        ? current.filter((item) => item !== contactId)
        : [...current, contactId]
    );
  };

  const pickGroupImage = async () => {
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
  };

  const handleCreateGroup = () => {
    if (!title.trim() || selectedIds.length === 0) {
      Alert.alert('Informations manquantes', 'Ajoutez un nom et au moins un membre.');
      return;
    }

    const conversationId = createGroupConversation({
      title,
      participantIds: selectedIds,
      avatar: avatarUri,
    });

    navigation.replace('ChatRoom', { conversationId });
  };

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

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Nom groupe</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Core Messaging Squad"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Selection contacts</Text>

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
                <MessagingAvatar
                  uri={item.avatar}
                  label={item.name}
                  color={item.avatarColor}
                  kind="direct"
                  online={item.isOnline}
                />
                <View style={styles.contactText}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactMeta}>{item.roleLabel}</Text>
                </View>
                <View style={[styles.checkWrap, selected && styles.checkWrapSelected]}>
                  {selected ? <Ionicons name="checkmark" size={16} color={theme.colors.white} /> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  inputWrap: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
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
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.typography.title3,
  },
  listContent: {
    paddingBottom: 120,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
