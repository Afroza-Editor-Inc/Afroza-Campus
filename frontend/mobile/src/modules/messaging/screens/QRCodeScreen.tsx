import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { Avatar } from '../components';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import { useMessagingStore } from '../store/useMessagingStore';
import { messagingGradient, messagingSpacing, useMessagingPalette } from '../theme';
import type { QrEntryMode } from '../types';

type Props = NativeStackScreenProps<MessagingStackParamList, 'QRCode'>;
type ScanTarget = 'contact' | 'device';

function buildQrGrid(seed: string) {
  return Array.from({ length: 21 * 21 }, (_, index) => {
    const charCode = seed.charCodeAt(index % seed.length) ?? 0;
    return ((index * 17 + charCode * 13) % 7) < 3;
  });
}

function QrMatrix({ seed, accent }: { seed: string; accent: string }) {
  const cells = React.useMemo(() => buildQrGrid(seed), [seed]);

  return (
    <View style={[styles.qrMatrix, { borderColor: accent }]}>
      {cells.map((filled, index) => (
        <View
          key={`${seed}_${index}`}
          style={[
            styles.qrCell,
            { backgroundColor: filled ? accent : 'transparent' },
          ]}
        />
      ))}
    </View>
  );
}

export default function QRCodeScreen({ route, navigation }: Props) {
  const palette = useMessagingPalette();
  const contacts = useMessagingStore((state) =>
    state.contacts.filter((contact) => contact.isOnAfroza).slice(0, 4)
  );
  const openDirectConversation = useMessagingStore((state) => state.openDirectConversation);
  const connectDevice = useMessagingStore((state) => state.connectDevice);
  const initialMode: QrEntryMode = route.params?.mode ?? 'scan';
  const [mode, setMode] = React.useState<QrEntryMode>(initialMode);
  const [scanTarget, setScanTarget] = React.useState<ScanTarget>(
    initialMode === 'device' ? 'device' : 'contact'
  );

  const handleContactScan = React.useCallback(
    (contactId: string) => {
      if (scanTarget === 'device') {
        connectDevice('Afroza Web sur navigateur scanne');
        navigation.replace('LinkedDevices');
        return;
      }

      const conversationId = openDirectConversation(contactId);
      navigation.replace('Chat', { conversationId });
    },
    [connectDevice, navigation, openDirectConversation, scanTarget]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={[styles.safeArea, { backgroundColor: palette.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.text }]}>QR code</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.tabRow, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
          {[
            { key: 'scan' as const, label: 'Scanner' },
            { key: 'profile' as const, label: 'Mon QR' },
          ].map((item) => {
            const active = mode === item.key;

            return (
              <Pressable
                key={item.key}
                onPress={() => setMode(item.key)}
                style={[
                  styles.tabButton,
                  active && { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.tabText, { color: active ? palette.text : palette.textMuted }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'profile' ? (
          <LinearGradient colors={['rgba(0,114,255,0.14)', 'rgba(0,255,106,0.08)']} style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <Avatar
                label="Karel Afroza"
                color={theme.colors.primary}
                kind="direct"
                size={62}
                online
              />
              <View style={styles.profileText}>
                <Text style={[styles.profileName, { color: palette.text }]}>Karel Afroza</Text>
                <Text style={[styles.profileMeta, { color: palette.textMuted }]}>
                  Product builder · Afroza Campus
                </Text>
              </View>
            </View>

            <View style={[styles.qrCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <QrMatrix seed="AFROZA-KAREL-QR" accent={palette.activeStart} />
              <Text style={[styles.qrLabel, { color: palette.text }]}>afroza.app/u/karel-campus</Text>
              <Text style={[styles.qrHint, { color: palette.textMuted }]}>
                Scannez pour demarrer une discussion ou ajouter le profil.
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                onPress={() => Alert.alert('Partager mon QR', 'Pret pour integrer le partage natif.')}
                style={[styles.secondaryAction, { backgroundColor: palette.surface, borderColor: palette.border }]}
              >
                <Ionicons name="share-social-outline" size={18} color={palette.activeStart} />
                <Text style={[styles.secondaryText, { color: palette.text }]}>Partager</Text>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Copier le lien', 'Lien de profil copie dans le flow produit.')}
                style={[styles.secondaryAction, { backgroundColor: palette.surface, borderColor: palette.border }]}
              >
                <Ionicons name="copy-outline" size={18} color={palette.activeStart} />
                <Text style={[styles.secondaryText, { color: palette.text }]}>Copier</Text>
              </Pressable>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.scanSection}>
            <LinearGradient colors={['rgba(0,114,255,0.12)', 'rgba(0,255,106,0.08)']} style={styles.scanCard}>
              <Text style={[styles.scanTitle, { color: palette.text }]}>Scanner un QR Afroza</Text>
              <Text style={[styles.scanText, { color: palette.textMuted }]}>
                Ajoutez un contact en une seconde ou connectez Afroza Web depuis un navigateur.
              </Text>

              <View style={styles.scanFrameWrap}>
                <View style={[styles.scanFrame, { borderColor: palette.activeStart }]}>
                  <View style={[styles.scanCorner, styles.scanCornerTopLeft, { borderColor: palette.activeStart }]} />
                  <View style={[styles.scanCorner, styles.scanCornerTopRight, { borderColor: palette.activeStart }]} />
                  <View
                    style={[styles.scanCorner, styles.scanCornerBottomLeft, { borderColor: palette.activeStart }]}
                  />
                  <View
                    style={[styles.scanCorner, styles.scanCornerBottomRight, { borderColor: palette.activeStart }]}
                  />
                  <LinearGradient colors={messagingGradient} style={styles.scanLine} />
                </View>
              </View>

              <View style={styles.actionRow}>
                {[
                  { key: 'contact' as const, label: 'Ajouter contact' },
                  { key: 'device' as const, label: 'Connecter appareil' },
                ].map((item) => {
                  const active = scanTarget === item.key;

                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setScanTarget(item.key)}
                      style={[
                        styles.secondaryAction,
                        {
                          backgroundColor: active ? palette.surfaceStrong : palette.surface,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text style={[styles.secondaryText, { color: palette.text }]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Simulations rapides</Text>
              <Text style={[styles.sectionMeta, { color: palette.textMuted }]}>
                {scanTarget === 'device' ? 'Sessions web' : 'Contacts Afroza'}
              </Text>
            </View>

            {contacts.map((contact) => (
              <Pressable
                key={contact.id}
                onPress={() => handleContactScan(contact.id)}
                style={[
                  styles.scanResult,
                  { backgroundColor: palette.surface, borderColor: palette.border, shadowColor: palette.shadow },
                ]}
              >
                <Avatar
                  label={contact.name}
                  uri={contact.avatar}
                  color={contact.avatarColor}
                  kind="direct"
                  size={50}
                  online={contact.isOnline}
                />
                <View style={styles.scanResultBody}>
                  <Text style={[styles.scanResultName, { color: palette.text }]}>{contact.name}</Text>
                  <Text style={[styles.scanResultMeta, { color: palette.textMuted }]}>
                    {scanTarget === 'device'
                      ? `Connecter une session web via ${contact.firstName}`
                      : `${contact.roleLabel} · ${contact.profileStatus ?? contact.lastSeenLabel}`}
                  </Text>
                </View>
                <Ionicons name="qr-code-outline" size={18} color={palette.activeStart} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    paddingBottom: messagingSpacing.md,
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
  tabRow: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  profileCard: {
    borderRadius: 28,
    padding: theme.spacing.lg,
    gap: messagingSpacing.lg,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    ...theme.typography.title2,
  },
  profileMeta: {
    ...theme.typography.bodyMuted,
  },
  qrCard: {
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: messagingSpacing.md,
  },
  qrMatrix: {
    width: 226,
    height: 226,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.white,
  },
  qrCell: {
    width: '4.76%',
    aspectRatio: 1,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  qrHint: {
    ...theme.typography.bodyMuted,
    textAlign: 'center',
  },
  scanSection: {
    gap: theme.spacing.lg,
  },
  scanCard: {
    borderRadius: 28,
    padding: theme.spacing.lg,
    gap: messagingSpacing.md,
  },
  scanTitle: {
    ...theme.typography.title2,
  },
  scanText: {
    ...theme.typography.bodyMuted,
  },
  scanFrameWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(7,17,31,0.06)',
  },
  scanCorner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: theme.colors.primary,
  },
  scanCornerTopLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  scanCornerTopRight: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  scanCornerBottomLeft: {
    left: 14,
    bottom: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  scanCornerBottomRight: {
    right: 14,
    bottom: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  scanLine: {
    width: 180,
    height: 4,
    borderRadius: 999,
    opacity: 0.9,
  },
  actionRow: {
    flexDirection: 'row',
    gap: messagingSpacing.sm,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...theme.typography.title3,
  },
  sectionMeta: {
    ...theme.typography.label,
    fontSize: 12,
  },
  scanResult: {
    borderRadius: 24,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: messagingSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: messagingSpacing.md,
    ...theme.shadows.card,
  },
  scanResultBody: {
    flex: 1,
    gap: 2,
  },
  scanResultName: {
    fontSize: 15,
    fontWeight: '800',
  },
  scanResultMeta: {
    ...theme.typography.bodyMuted,
  },
});
