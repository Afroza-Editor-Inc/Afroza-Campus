import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface VoiceMessageProps {
  duration: number; // in seconds
  isPlaying?: boolean;
  onPlay?: () => void;
  isSent: boolean;
  isRead?: boolean;
}

export function VoiceMessage({
  duration,
  isPlaying,
  onPlay,
  isSent,
  isRead,
}: VoiceMessageProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isSent ? theme.colors.primary : theme.colors.surfaceMuted },
      ]}
    >
      <Ionicons
        name={isPlaying ? 'pause-circle' : 'play-circle'}
        size={28}
        color={isSent ? theme.colors.white : theme.colors.primary}
        onPress={onPlay}
      />
      <View style={styles.waveform}>
        {[...Array(15)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: Math.random() * 20 + 4,
                backgroundColor: isSent
                  ? 'rgba(255,255,255,0.6)'
                  : theme.colors.primary,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.duration}>
        <Text
          style={{
            color: isSent ? theme.colors.white : theme.colors.text,
            fontSize: 12,
            fontWeight: '500',
          }}
        >
          {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    maxWidth: '80%',
    marginHorizontal: theme.spacing.md,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  bar: {
    width: 2,
    borderRadius: 1,
  },
  duration: {
    minWidth: 30,
  },
});
