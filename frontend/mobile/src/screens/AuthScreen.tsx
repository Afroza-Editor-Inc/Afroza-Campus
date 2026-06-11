import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { AppButton, AppScreen, Pill } from '../components/ui';
import theme from '../theme';

export default function AuthScreen({ navigation, route }: any) {
  const [mode, setMode] = useState<'login' | 'signup'>(
    route?.params?.mode === 'signup' ? 'signup' : 'login'
  );

  return (
    <AppScreen scrollable contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoHero}>
          <Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Votre campus social, fluide et premium.</Text>
          <Text style={styles.description}>
            Messagerie, groupes, contenus, événements et identité Afroza réunis dans une seule
            expérience mobile.
          </Text>
        </View>
      </View>

      <View style={styles.segment}>
        <AppButton label="Connexion" onPress={() => setMode('login')} variant={mode === 'login' ? 'primary' : 'secondary'} />
        <AppButton label="Inscription" onPress={() => setMode('signup')} variant={mode === 'signup' ? 'primary' : 'secondary'} />
      </View>

      <View style={styles.badges}>
        <Pill label="OTP ready" active />
        <Pill label="Campus messaging" />
        <Pill label="Realtime social" />
      </View>

      {mode === 'login' ? <LoginForm onSuccess={() => navigation.replace('MainTabs')} /> : <SignupForm onSuccess={() => navigation.replace('MainTabs')} />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  hero: {
    gap: theme.spacing.lg,
  },
  logoHero: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  logo: {
    width: 58,
    height: 58,
  },
  copy: {
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.hero,
  },
  description: {
    ...theme.typography.bodyMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  segment: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
