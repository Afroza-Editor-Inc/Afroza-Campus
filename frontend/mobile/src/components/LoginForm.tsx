import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, GlassCard } from './ui';
import theme from '../theme';

interface Props {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Ajoutez votre email et votre mot de passe pour continuer.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 700);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.fields}>
        <AppInput
          label="Email académique"
          value={email}
          onChangeText={setEmail}
          placeholder="prenom@campus.afroza"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="Votre mot de passe"
          secureTextEntry
          hint="Connexion sécurisée, reprise des conversations et groupes instantanée."
        />
      </View>
      <Text style={styles.recovery}>Mot de passe oublié ? Réinitialisation rapide via OTP.</Text>
      <AppButton label={loading ? 'Connexion...' : 'Se connecter'} onPress={handleLogin} disabled={loading} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
  },
  fields: {
    gap: theme.spacing.md,
  },
  recovery: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
});
