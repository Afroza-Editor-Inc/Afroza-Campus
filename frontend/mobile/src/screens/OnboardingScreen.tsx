import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/ui';
import theme from '../theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Restez connectés\nà tout votre campus',
    description:
      'Messagerie, groupes, canaux et appels réunis : communiquez avec vos camarades et vos communautés sans friction.',
    image: require('../assets/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Communautés, projets\net entraide étudiante',
    description:
      'Rejoignez vos facultés et clubs, collaborez sur des projets, partagez ressources et tâches comme une vraie équipe.',
    image: require('../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Créez, publiez\net faites grandir vos idées',
    description:
      'Stories, reels et publications : une expérience sociale premium pensée pour les créateurs et leaders de communauté.',
    image: require('../assets/onboarding3.png'),
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const isLast = index === slides.length - 1;

  const goToWelcome = () => navigation.replace('Welcome');

  const next = () => {
    if (isLast) {
      goToWelcome();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable hitSlop={theme.accessibility.hitSlop} onPress={goToWelcome}>
          <Text style={styles.skipTop}>Passer</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={slides}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustrationWrap}>
              <View style={styles.illustrationGlow} />
              <Image source={item.image} resizeMode="contain" style={styles.image} />
            </View>
          </View>
        )}
      />

      <View style={styles.card}>
        <Text style={styles.title}>{slides[index].title}</Text>
        <Text style={styles.description}>{slides[index].description}</Text>

        <View style={styles.pagination}>
          {slides.map((slide, slideIndex) => (
            <View key={slide.id} style={[styles.dot, index === slideIndex && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton label={isLast ? 'Commencer' : 'Suivant'} onPress={next} />
          {!isLast ? <AppButton label="Passer" onPress={goToWelcome} variant="ghost" /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  skipTop: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  illustrationWrap: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationGlow: {
    position: 'absolute',
    width: '78%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  image: {
    width: '92%',
    height: '92%',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  title: {
    ...theme.typography.title1,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodyMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.borderStrong,
  },
  dotActive: {
    width: 28,
    backgroundColor: theme.colors.primary,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
