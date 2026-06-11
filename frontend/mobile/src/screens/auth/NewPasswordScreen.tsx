import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui';
import { AuthBackButton, AuthField, AuthHeading } from '../../components/auth/AuthKit';
import theme from '../../theme';

export default function NewPasswordScreen({ navigation }: any) {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  const matches = password.length >= 6 && password === confirm;
  const showMismatch = confirm.length > 0 && password !== confirm;

  const submit = () => {
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AuthBackButton onPress={() => navigation.goBack()} />

        <AuthHeading
          title="Nouveau mot de passe"
          subtitle="Choisissez un mot de passe sécurisé d'au moins 6 caractères."
        />

        <View style={styles.form}>
          <AuthField
            icon="lock-closed-outline"
            placeholder="Nouveau mot de passe"
            secureToggle
            value={password}
            onChangeText={setPassword}
          />
          <AuthField
            icon="lock-closed-outline"
            placeholder="Confirmer le mot de passe"
            secureToggle
            value={confirm}
            onChangeText={setConfirm}
          />
          {showMismatch ? (
            <Text style={styles.error}>Les mots de passe ne correspondent pas.</Text>
          ) : null}

          <AppButton label="Réinitialiser" onPress={submit} disabled={!matches} />
        </View>
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
  form: {
    gap: theme.spacing.md,
  },
  error: {
    ...theme.typography.bodyMuted,
    color: theme.colors.danger,
  },
});
