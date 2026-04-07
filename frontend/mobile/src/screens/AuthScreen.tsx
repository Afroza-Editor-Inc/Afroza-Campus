// frontend/mobile/src/screens/AuthScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import theme from '../theme';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

export default function AuthScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Afroza Campus</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        {isLogin ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <SignupForm onSuccess={handleAuthSuccess} />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
        </Text>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  switchText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
  },
});