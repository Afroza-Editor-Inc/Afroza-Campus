import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../components/ui';
import theme from '../theme';

type SocialProvider = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
};

const PROVIDERS: SocialProvider[] = [
  { key: 'google', label: 'Continuer avec Google', icon: 'logo-google', color: '#DB4437' },
  { key: 'apple', label: 'Continuer avec Apple', icon: 'logo-apple', color: theme.colors.textStrong },
  { key: 'facebook', label: 'Continuer avec Facebook', icon: 'logo-facebook', color: '#1877F2' },
];

export default function WelcomeScreen({ navigation }: any) {
  const continueWithProvider = () => navigation.replace('MainTabs');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Retour"
          hitSlop={theme.accessibility.hitSlop}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo} />
        <Text style={styles.title}>Bienvenue sur Afroza Campus</Text>
        <Text style={styles.subtitle}>Connectez-vous pour rejoindre votre campus</Text>
      </View>

      <View style={styles.providers}>
        {PROVIDERS.map((provider) => (
          <Pressable
            key={provider.key}
            accessibilityRole="button"
            accessibilityLabel={provider.label}
            onPress={continueWithProvider}
            style={({ pressed }) => [styles.providerButton, pressed && styles.pressed]}
          >
            <Ionicons name={provider.icon} size={22} color={provider.color} />
            <Text style={styles.providerLabel}>{provider.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <AppButton
        label="Se connecter avec un mot de passe"
        onPress={() => navigation.navigate('SignIn')}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ?</Text>
        <Pressable hitSlop={theme.accessibility.hitSlop} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerLink}>S'inscrire</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  topBar: {
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    width: theme.accessibility.minTouchTarget,
    height: theme.accessibility.minTouchTarget,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title1,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  providers: {
    gap: theme.spacing.md,
  },
  providerButton: {
    minHeight: 56,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  providerLabel: {
    ...theme.typography.label,
    fontSize: 15,
    color: theme.colors.text,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.borderStrong,
  },
  dividerText: {
    ...theme.typography.bodyMuted,
    color: theme.colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.bodyMuted,
  },
  footerLink: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
});
