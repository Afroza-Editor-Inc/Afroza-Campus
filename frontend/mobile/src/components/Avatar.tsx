import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import theme from '../theme';

type Props = {
  uri?: string;
  size?: number;
  userName?: string;
  ring?: boolean;
};

export default function Avatar({ uri, size = 48, userName, ring = false }: Props) {
  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }]}> 
      <Image
        source={uri ? { uri } : require('../assets/avatar-placeholder.png')}
        style={[styles.img, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}
      />
      {userName ? <Text style={styles.name} numberOfLines={1}>{userName}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.sm,
    // subtle ring shadow when story active
    shadowColor: '#24C48B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  img: {
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  name: {
    marginTop: 6,
    fontSize: theme.typography.fontSizeSm,
    color: theme.colors.muted,
    maxWidth: 64,
  },
});