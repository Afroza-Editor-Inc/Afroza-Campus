import React from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, TouchableWithoutFeedback, Vibration, Platform } from 'react-native';
import theme from '../theme';
import Avatar from './Avatar';
import ActionBar from './ActionBar';
import { Post } from '../data/mock';

type Props = Post;

export default function PostCard({ user, image, caption, likes, comments, timestamp, liked, saved }: Props) {
  const [isLiked, setIsLiked] = React.useState(liked);
  const [likesCount, setLikesCount] = React.useState(likes);
  const [isSaved, setIsSaved] = React.useState(saved);
  const heartScale = React.useRef(new Animated.Value(0)).current;
  const tapTimeout = React.useRef<number | null>(null);
  const lastTap = React.useRef<number>(0);

  const triggerHaptic = () => {
    try {
      if (Platform.OS === 'ios') {
        Vibration.vibrate(10);
      } else {
        Vibration.vibrate(10);
      }
    } catch (e) {
      // ignore
    }
  };

  const animateHeart = () => {
    heartScale.setValue(0);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.2, duration: 160, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(heartScale, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
    ]).start();
  };

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(c => (newLiked ? c + 1 : c - 1));
    animateHeart();
    triggerHaptic();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  // simple double-tap detection on image to like
  const onImagePress = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // double tap
      if (!isLiked) {
        handleLike();
      } else {
        // already liked -- small feedback
        triggerHaptic();
        animateHeart();
      }
      lastTap.current = 0;
      if (tapTimeout.current) { clearTimeout(tapTimeout.current); tapTimeout.current = null; }
    } else {
      lastTap.current = now;
      // reset if no second tap
      tapTimeout.current = (setTimeout(() => { lastTap.current = 0; tapTimeout.current = null; }, 350) as any) as number;
    }
  };

  const heartStyle = {
    transform: [{ scale: heartScale }],
    opacity: heartScale.interpolate({ inputRange: [0, 0.5, 1.2], outputRange: [0, 1, 0] }),
  } as any;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar uri={user.avatar} size={40} userName={user.name} />
        <View style={{flex:1,marginLeft:8}}>
          <Text style={styles.user}>{user.name}</Text>
          <Text style={styles.time}>{timestamp}</Text>
        </View>
        <Text style={styles.menu}>⋯</Text>
      </View>
      <TouchableWithoutFeedback onPress={onImagePress}>
        <View>
          <Image source={{ uri: image }} style={styles.image} />
          <Animated.View style={[styles.heartOverlay, heartStyle]} pointerEvents="none">
            <Text style={{fontSize:56}}>❤️</Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <ActionBar likes={likesCount} liked={isLiked} onLike={handleLike} saved={isSaved} onSave={handleSave} />
      <View style={styles.meta}>
        <Text style={styles.likes}>{likesCount} J'aime</Text>
        <Text style={styles.caption}>{caption}</Text>
        <Text style={styles.comments}>Voir les {comments} commentaires</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    margin: theme.spacing.sm,
    flex: 1,
    minWidth: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  user: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  time: {
    fontSize: theme.typography.fontSizeSm,
    color: theme.colors.muted,
  },
  menu: {
    fontSize: 18,
    color: theme.colors.muted,
    paddingHorizontal: theme.spacing.sm,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
  },
  heartOverlay: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    padding: theme.spacing.sm,
  },
  likes: {
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  caption: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  comments: {
    color: theme.colors.muted,
    fontSize: theme.typography.fontSizeSm,
  },
});
