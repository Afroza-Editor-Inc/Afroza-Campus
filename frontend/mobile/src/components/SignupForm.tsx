import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, GlassCard } from './ui';
import theme from '../theme';

interface Props {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: Props) {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Informations manquantes', 'Complétez votre profil de base pour recevoir votre code OTP.');
      return;
    }
    setStep('otp');
  };

  const handleSignup = () => {
    if (otp.trim().length < 4) {
      Alert.alert('Code OTP invalide', 'Entrez le code reçu par SMS ou email pour activer le compte.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <GlassCard style={styles.card}>
      {step === 'details' ? (
        <View style={styles.fields}>
          <AppInput label="Nom complet" value={name} onChangeText={setName} placeholder="Fatima Hassan" />
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="fatima@campus.afroza"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Téléphone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+237 6 90 00 00 00"
            keyboardType="phone-pad"
          />
          <AppInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Créez un mot de passe"
            secureTextEntry
            hint="Minimum 8 caractères. Le profil sera activé via OTP."
          />
          <AppButton label="Recevoir le code OTP" onPress={handleContinue} />
        </View>
      ) : (
        <View style={styles.fields}>
          <View style={styles.otpHeader}>
            <Text style={styles.otpTitle}>Validation du compte</Text>
            <Text style={styles.otpText}>
              Un code a été envoyé à {phone || email}. Activez votre compte pour accéder aux groupes,
              messages et publications.
            </Text>
          </View>
          <AppInput
            label="Code OTP"
            value={otp}
            onChangeText={setOtp}
            placeholder="2481"
            keyboardType="number-pad"
            hint="Simulation frontend prête pour l’intégration backend."
          />
          <AppButton label={loading ? 'Activation...' : 'Activer mon compte'} onPress={handleSignup} disabled={loading} />
          <Pressable onPress={() => setStep('details')}>
            <Text style={styles.backLink}>Modifier les informations</Text>
          </Pressable>
        </View>
      )}
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
  otpHeader: {
    gap: theme.spacing.xs,
  },
  otpTitle: {
    ...theme.typography.title3,
  },
  otpText: {
    ...theme.typography.bodyMuted,
  },
  backLink: {
    ...theme.typography.label,
    color: theme.colors.primary,
    textAlign: 'center',
  },
});
