import React, { useEffect } from 'react';
import { View, Text, Image, Animated, StyleSheet, Pressable } from 'react-native';
import theme from '../theme';

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  const goToOnboarding = () => {
    navigation.replace('Onboarding');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      goToOnboarding();
    }, 1500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Afroza Campus</Text>
        <Text style={styles.subtitle}>Réseau social étudiant</Text>
      </Animated.View>
      <Animated.View style={[styles.loading, { opacity: fadeAnim }]}>
        <Text style={styles.loadingText}>Initialisation de l'application...</Text>
        <Pressable onPress={goToOnboarding} style={styles.button}>
          <Text style={styles.buttonText}>Continuer</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.background,
    opacity: 0.8,
  },
  loading: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.background,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
