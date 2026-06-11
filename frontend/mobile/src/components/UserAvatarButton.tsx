import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';
import { mockUsers } from '../data/mock';

type UserAvatarButtonProps = {
  size?: number;
  showRing?: boolean;
};

export default function UserAvatarButton({ size = 36, showRing = true }: UserAvatarButtonProps) {
  const navigation = useNavigation<any>();
  const user = mockUsers[5] ?? mockUsers[0];

  const openProfile = () => {
    hapticFeedback.light();
    navigation.navigate('Profile');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir mon profil"
      hitSlop={theme.accessibility.hitSlop}
      onPress={openProfile}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.ring,
          showRing && styles.ringActive,
          { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 },
        ]}
      >
        <Image source={{ uri: user.avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringActive: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: 1,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
