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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';

type Props = NativeStackScreenProps<MessagingStackParamList, 'CreateContact'>;

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

export default function CreateContactScreen({ navigation }: Props) {
  const createContact = useMessagingStore((state) => state.createContact);
  const openDirectConversation = useMessagingStore((state) => state.openDirectConversation);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('+237');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSave = React.useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      Alert.alert('Informations manquantes', 'Remplissez le nom, prenom et numero.');
      return;
    }

    setSubmitting(true);

    try {
      const contactId = createContact({
        firstName,
        lastName,
        countryCode,
        phoneNumber,
      });
      const conversationId = openDirectConversation(contactId);

      navigation.replace('Chat', { conversationId });
    } finally {
      setSubmitting(false);
    }
  }, [
    countryCode,
    createContact,
    firstName,
    lastName,
    navigation,
    openDirectConversation,
    phoneNumber,
  ]);

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

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Identity</Text>
          <Text style={styles.heroTitle}>Ajoutez un nouveau contact Afroza</Text>
          <Text style={styles.heroText}>
            Validation stricte, creation de conversation directe et structure prete pour sync backend.
          </Text>
        </View>

        <View style={styles.card}>
          <Field label="Nom" value={lastName} onChangeText={setLastName} placeholder="Ex: Mbarga" />
          <Field
            label="Prenom"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ex: Aline"
          />

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
              onPress={() => Alert.alert(item.label, 'Action prete pour integration ulterieure.')}
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

        <Pressable
          onPress={handleSave}
          disabled={submitting}
          style={({ pressed }) => [
            styles.saveButton,
            (pressed || submitting) && { transform: [{ scale: 0.985 }] },
          ]}
        >
          <Text style={styles.saveText}>
            {submitting ? 'Creation...' : 'Enregistrer et ouvrir la discussion'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: theme.spacing.sm,
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
  headerSpacer: {
    width: 42,
  },
  title: {
    ...theme.typography.title3,
  },
  heroCard: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: 4,
    ...theme.shadows.card,
  },
  heroEyebrow: {
    ...theme.typography.label,
    color: theme.colors.primaryDeep,
  },
  heroTitle: {
    ...theme.typography.title2,
  },
  heroText: {
    ...theme.typography.bodyMuted,
  },
  card: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
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
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
  },
  actionRow: {
    minHeight: 58,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 56,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glow,
  },
  saveText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
});

