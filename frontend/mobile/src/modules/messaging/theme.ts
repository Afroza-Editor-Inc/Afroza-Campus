import React from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import appTheme from '../../theme';

export type MessagingPalette = ReturnType<typeof getMessagingPalette>;

export const messagingSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const messagingGradient = ['#0072FF', '#00A3FF', '#00FF6A'] as const;

export function getMessagingPalette(colorScheme: ColorSchemeName) {
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    background: isDark ? '#07111F' : appTheme.colors.surfaceMuted,
    surface: isDark ? '#0D192B' : '#FFFFFF',
    surfaceMuted: isDark ? '#102039' : '#F2F6FB',
    surfaceStrong: isDark ? '#142642' : appTheme.colors.surfaceStrong,
    surfaceElevated: isDark ? '#12233D' : '#FFFFFF',
    text: isDark ? '#F6FAFF' : '#151B2C',
    textMuted: isDark ? '#9FB0C8' : appTheme.colors.textMuted,
    textSoft: isDark ? '#7B8CA7' : '#9AA7BA',
    border: isDark ? 'rgba(151, 180, 219, 0.16)' : 'rgba(15, 40, 77, 0.08)',
    divider: isDark ? 'rgba(151, 180, 219, 0.12)' : 'rgba(15, 40, 77, 0.06)',
    focusRing: isDark ? 'rgba(0, 153, 255, 0.34)' : 'rgba(0, 114, 255, 0.22)',
    activeStart: appTheme.colors.primary,
    activeEnd: appTheme.colors.secondaryDeep,
    activeGlow: appTheme.colors.accent,
    unread: '#1682FF',
    unreadText: appTheme.colors.white,
    online: '#25D366',
    icon: isDark ? '#D8E2F2' : '#4B5568',
    pillIdle: isDark ? '#0E1A2E' : '#FCFDFE',
    pillIdleBorder: isDark ? 'rgba(175, 194, 224, 0.15)' : 'rgba(21, 27, 44, 0.12)',
    menuBackground: isDark ? '#101C31' : '#FFFFFF',
    overlay: 'rgba(7, 15, 29, 0.42)',
    shadow: isDark ? '#000000' : '#163C70',
    heroPrimary: isDark ? 'rgba(0, 114, 255, 0.18)' : 'rgba(0, 114, 255, 0.11)',
    heroSecondary: isDark ? 'rgba(0, 197, 87, 0.18)' : 'rgba(0, 255, 106, 0.10)',
    avatarRing: isDark ? '#07111F' : appTheme.colors.surfaceMuted,
  };
}

export function useMessagingPalette() {
  const colorScheme = useColorScheme();

  return React.useMemo(() => getMessagingPalette(colorScheme), [colorScheme]);
}
