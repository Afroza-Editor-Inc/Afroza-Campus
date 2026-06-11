import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function SignInScreen({ navigation }: any) {
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [stayConnected, setStayConnected] = React.useState(true);

  const enterApp = () => navigation.replace('MainTabs');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthBackButton onPress={() => navigation.goBack()} />

        <AuthHeading
          title={'Connectez-vous\nà votre compte'}
          subtitle="Retrouvez vos discussions, communautés et projets."
        />

        <View style={styles.form}>
          <AuthField
            icon="mail-outline"
            placeholder="Email ou téléphone"
            autoCapitalize="none"
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <AuthField
            icon="lock-closed-outline"
            placeholder="Mot de passe"
            secureToggle
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.optionsRow}>
            <AuthCheckbox
              checked={stayConnected}
              label="Rester connecté"
              onToggle={() => setStayConnected((value) => !value)}
            />
            <Pressable hitSlop={theme.accessibility.hitSlop} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgot}>Mot de passe oublié ?</Text>
            </Pressable>
          </View>

          <AppButton label="Se connecter" onPress={enterApp} />
        </View>

        <AuthDivider />
        <AuthSocialRow onPress={enterApp} />

        <AuthFooterLink
          text="Pas encore de compte ?"
          linkLabel="S'inscrire"
          onPress={() => navigation.navigate('SignUp')}
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
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  forgot: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
});
