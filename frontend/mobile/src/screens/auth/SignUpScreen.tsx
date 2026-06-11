import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui';
import {
  AuthBackButton,
  AuthCheckbox,
  AuthDivider,
  AuthField,
  AuthFooterLink,
  AuthHeading,
  AuthSocialRow,
} from '../../components/auth/AuthKit';
import theme from '../../theme';

export default function SignUpScreen({ navigation }: any) {
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [stayConnected, setStayConnected] = React.useState(true);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const createAccount = () => navigation.navigate('ProfileSetup');
  const continueWithSocial = () => navigation.replace('MainTabs');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthBackButton onPress={() => navigation.goBack()} />

        <AuthHeading
          title={'Créez votre\ncompte Afroza'}
          subtitle="Rejoignez votre campus en quelques secondes."
        />

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <AuthField
                icon="person-outline"
                placeholder="Prénom"
                value={form.firstName}
                onChangeText={update('firstName')}
              />
            </View>
            <View style={styles.rowItem}>
              <AuthField
                icon="person-outline"
                placeholder="Nom"
                value={form.lastName}
                onChangeText={update('lastName')}
              />
            </View>
          </View>

          <AuthField
            icon="mail-outline"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={update('email')}
          />
          <AuthField
            icon="call-outline"
            placeholder="Téléphone"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={update('phone')}
          />
          <AuthField
            icon="lock-closed-outline"
            placeholder="Mot de passe"
            secureToggle
            value={form.password}
            onChangeText={update('password')}
          />

          <AuthCheckbox
            checked={acceptTerms}
            label="J'accepte les conditions d'utilisation et la politique de confidentialité."
            onToggle={() => setAcceptTerms((value) => !value)}
          />
          <AuthCheckbox
            checked={stayConnected}
            label="Rester connecté"
            onToggle={() => setStayConnected((value) => !value)}
          />

          <AppButton label="Créer mon compte" onPress={createAccount} disabled={!acceptTerms} />
        </View>

        <AuthDivider />
        <AuthSocialRow onPress={continueWithSocial} />

        <AuthFooterLink
          text="Déjà un compte ?"
          linkLabel="Se connecter"
          onPress={() => navigation.navigate('SignIn')}
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
  form: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  rowItem: {
    flex: 1,
  },
});
