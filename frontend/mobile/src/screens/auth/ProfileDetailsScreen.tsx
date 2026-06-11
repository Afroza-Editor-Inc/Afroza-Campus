import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from '../../components/ui';
import { AuthBackButton, AuthHeading } from '../../components/auth/AuthKit';
import { AuthSteps } from '../../components/auth/AuthSteps';
import theme from '../../theme';

const INTERESTS = [
  'Développement', 'Design', 'Entrepreneuriat', 'Sport', 'Musique', 'Lecture', 'Cinéma',
  'Photographie', 'Bénévolat', 'Sciences', 'Débat', 'Gaming', 'Voyage', 'Mode', 'Cuisine',
];

const BIO_LIMIT = 160;

export default function ProfileDetailsScreen({ navigation }: any) {
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [bio, setBio] = React.useState('');
  const [interests, setInterests] = React.useState<string[]>([]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthBackButton onPress={() => navigation.goBack()} />
        <AuthSteps total={3} current={2} />

        <AuthHeading
          title="Complétez votre profil"
          subtitle="Une photo, une bio et vos centres d'intérêt pour vous démarquer."
        />

        <View style={styles.photoWrap}>
          <Pressable accessibilityLabel="Ajouter une photo" onPress={pickPhoto} style={styles.photo}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} />
            ) : (
              <Ionicons name="person-outline" size={44} color={theme.colors.textMuted} />
            )}
            <View style={styles.photoBadge}>
              <Ionicons name="camera" size={16} color={theme.colors.white} />
            </View>
          </Pressable>
          <Text style={styles.photoHint}>Ajouter une photo</Text>
        </View>

        <View style={styles.bioWrap}>
          <Text style={styles.label}>Bio</Text>
          <View style={styles.bioField}>
            <TextInput
              value={bio}
              onChangeText={(value) => setBio(value.slice(0, BIO_LIMIT))}
              placeholder="Présentez-vous en quelques mots..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.bioInput}
              multiline
            />
            <Text style={styles.bioCount}>
              {bio.length}/{BIO_LIMIT}
            </Text>
          </View>
        </View>

        <View style={styles.interestsWrap}>
          <Text style={styles.label}>Centres d'intérêt</Text>
          <View style={styles.chips}>
            {INTERESTS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{interest}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <AppButton
          label="Continuer"
          disabled={interests.length === 0}
          onPress={() => navigation.navigate('FriendSuggestions')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  photoWrap: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  photo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  photoHint: {
    ...theme.typography.bodyMuted,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.sm,
  },
  bioWrap: {},
  bioField: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    minHeight: 110,
  },
  bioInput: {
    flex: 1,
    ...theme.typography.body,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  bioCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    alignSelf: 'flex-end',
  },
  interestsWrap: {},
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  chipTextSelected: {
    color: theme.colors.white,
  },
});
