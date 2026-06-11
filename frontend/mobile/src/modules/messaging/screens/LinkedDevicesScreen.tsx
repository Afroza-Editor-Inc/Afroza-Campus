import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';

type Props = NativeStackScreenProps<MessagingStackParamList, 'LinkedDevices'>;

export default function LinkedDevicesScreen({ navigation }: Props) {
  const palette = useMessagingPalette();
  const devices = useMessagingStore((state) => state.connectedDevices);
  const disconnectDevice = useMessagingStore((state) => state.disconnectDevice);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Appareils connectes</Text>
          <View style={styles.headerSpacer} />
        </View>

        <LinearGradient colors={['rgba(0,114,255,0.14)', 'rgba(0,255,106,0.10)']} style={styles.hero}>
          <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
            <Ionicons name="laptop-outline" size={20} color={theme.colors.white} />
          </View>
          <Text style={styles.heroTitle}>Votre session reste synchronisee partout</Text>
          <Text style={styles.heroText}>
            Scannez un QR code pour connecter Afroza Web ou retirez un appareil en un geste.
          </Text>
          <Pressable onPress={() => navigation.navigate('QRCode', { mode: 'device' })} style={styles.ctaWrap}>
            <LinearGradient colors={messagingGradient} style={styles.cta}>
              <Ionicons name="qr-code-outline" size={18} color={theme.colors.white} />
              <Text style={styles.ctaText}>Connecter un appareil</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Sessions actives</Text>
          <Text style={[styles.sectionMeta, { color: palette.textMuted }]}>{devices.length}</Text>
        </View>

        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: messagingSpacing.sm }} />}
          renderItem={({ item }) => (
            <View
              style={[
                styles.deviceCard,
                { backgroundColor: palette.surface, borderColor: palette.border, shadowColor: palette.shadow },
              ]}
            >
              <View style={[styles.deviceIcon, { backgroundColor: palette.surfaceMuted }]}>
                <Ionicons
                  name={item.platform.includes('iPad') ? 'tablet-portrait-outline' : 'desktop-outline'}
                  size={20}
                  color={palette.activeStart}
                />
              </View>

              <View style={styles.deviceBody}>
                <View style={styles.deviceTopRow}>
                  <Text style={[styles.deviceName, { color: palette.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: item.isActive ? 'rgba(0,255,106,0.14)' : palette.surfaceMuted },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: item.isActive ? theme.colors.secondaryDeep : palette.textMuted },
                      ]}
                    >
                      {item.isActive ? 'Actif' : 'Recent'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.deviceMeta, { color: palette.textMuted }]} numberOfLines={1}>
                  {item.platform} · {item.browser}
                </Text>
                <Text style={[styles.deviceMeta, { color: palette.textMuted }]} numberOfLines={1}>
                  {item.location} · {item.lastSeenLabel}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Deconnecter cet appareil',
                    `La session ${item.name} sera retiree immediatement.`,
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Deconnecter',
                        style: 'destructive',
                        onPress: () => disconnectDevice(item.id),
                      },
                    ]
                  )
                }
                style={[styles.disconnectButton, { borderColor: palette.border }]}
              >
                <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
              </Pressable>
            </View>
          )}
          ListFooterComponent={
            <View
              style={[
                styles.footerCard,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={palette.activeStart} />
              <Text style={[styles.footerText, { color: palette.textMuted }]}>
                Les sessions web utilisent le chiffrement et peuvent etre coupees a distance.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    paddingBottom: messagingSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.title3,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 42,
  },
  hero: {
    borderRadius: 28,
    padding: theme.spacing.lg,
    gap: messagingSpacing.md,
    marginBottom: theme.spacing.xl,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...theme.typography.title2,
    color: theme.colors.white,
  },
  heroText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.78)',
  },
  ctaWrap: {
    alignSelf: 'flex-start',
  },
  cta: {
    minHeight: 46,
    borderRadius: 23,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: theme.colors.white,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: messagingSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...theme.typography.title3,
  },
  sectionMeta: {
    ...theme.typography.label,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  deviceCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
    ...theme.shadows.card,
  },
  deviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceBody: {
    flex: 1,
    gap: 2,
  },
  deviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  deviceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deviceMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  disconnectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCard: {
    marginTop: theme.spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.sm,
  },
  footerText: {
    flex: 1,
    ...theme.typography.bodyMuted,
  },
});
