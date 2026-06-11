import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
import { useMessagesStore } from '../../../store/messagesStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MessagesStackParamList } from '../navigation/MessagesNavigator';

type Props = NativeStackScreenProps<MessagesStackParamList, 'CreateContact'>;

export default function CreateContactScreen({ navigation }: Props) {
  const createContact = useMessagesStore((state) => state.createContact);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('+237');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      Alert.alert('Informations manquantes', 'Remplissez le nom, prenom et numero.');
      return;
    }

    const contactId = createContact({
      firstName,
      lastName,
      countryCode,
      phoneNumber,
    });
    const conversationId = useMessagesStore.getState().openDirectConversation(contactId);

    navigation.replace('ChatRoom', { conversationId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Creer un contact</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Field label="Nom" value={lastName} onChangeText={setLastName} placeholder="Ex: Mbarga" />
          <Field label="Prenom" value={firstName} onChangeText={setFirstName} placeholder="Ex: Aline" />

          <View style={styles.row}>
            <Field
              label="Pays"
              value={countryCode}
              onChangeText={setCountryCode}
              placeholder="+237"
              style={styles.countryField}
            />
            <Field
              label="Numero"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="699 12 45 33"
              keyboardType="phone-pad"
              style={styles.phoneField}
            />
          </View>
        </View>

        <View style={styles.actionsCard}>
          {[
            { label: 'Sync Google', icon: 'logo-google' as const },
            { label: 'Scanner QR code', icon: 'qr-code-outline' as const },
            { label: 'Partager QR', icon: 'share-social-outline' as const },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => Alert.alert(item.label, 'Action prete pour integration laterale.')}
              style={styles.actionRow}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Enregistrer et ouvrir la discussion</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  style,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={[styles.fieldWrap, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
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
  headerSpacer: {
    width: 42,
  },
  title: {
    ...theme.typography.title3,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fieldWrap: {
    gap: 8,
  },
  countryField: {
    flex: 0.38,
  },
  phoneField: {
    flex: 0.62,
  },
  fieldLabel: {
    ...theme.typography.label,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
  },
  actionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  actionText: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 56,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  saveText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
