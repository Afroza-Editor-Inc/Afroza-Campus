import React, { useEffect } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

type Petal = {
  top: `${number}%`;
  left: `${number}%`;
  size: number;
  color: string;
};

const PETALS: Petal[] = [
  { top: '18%', left: '22%', size: 14, color: theme.colors.primarySoft },
  { top: '24%', left: '74%', size: 10, color: theme.colors.secondarySoft },
  { top: '34%', left: '12%', size: 18, color: theme.colors.secondarySoft },
  { top: '30%', left: '84%', size: 22, color: theme.colors.primarySoft },
  { top: '54%', left: '16%', size: 24, color: theme.colors.primarySoft },
  { top: '58%', left: '80%', size: 12, color: theme.colors.secondarySoft },
  { top: '46%', left: '50%', size: 8, color: theme.colors.secondarySoft },
];

function LoaderDot({ delay }: { delay: number }) {
  const value = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, value]);

  return (
    <Animated.View
      style={[
        styles.loaderDot,
        {
          opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] }) }],
        },
      ]}
    />
  );
}

export default function SplashScreen({ navigation }: any) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const rise = React.useRef(new Animated.Value(20)).current;
  const scale = React.useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 70 }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Onboarding'), 2000);
    return () => clearTimeout(timer);
  }, [fade, navigation, rise, scale]);

  return (
    <View style={styles.container}>
      {PETALS.map((petal, i) => (
        <View
          key={i}
          style={[
            styles.petal,
            {
              top: petal.top,
              left: petal.left,
              width: petal.size,
              height: petal.size,
              borderRadius: petal.size / 2,
              backgroundColor: petal.color,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.content,
          { opacity: fade, transform: [{ translateY: rise }, { scale }] },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoShell}
        >
          <Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo} />
        </LinearGradient>
        <Text style={styles.title}>Afroza Campus</Text>
      </Animated.View>

      <Animated.View style={[styles.loader, { opacity: fade }]}>
        <LoaderDot delay={0} />
        <LoaderDot delay={140} />
        <LoaderDot delay={280} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  logoShell: {
    width: 104,
    height: 104,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glow,
  },
  logo: {
    width: 60,
    height: 60,
    tintColor: theme.colors.white,
  },
  title: {
    ...theme.typography.title2,
    color: theme.colors.textStrong,
    fontWeight: '800',
  },
  loader: {
    position: 'absolute',
    bottom: 96,
    flexDirection: 'row',
    gap: 8,
  },
  loaderDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
});
