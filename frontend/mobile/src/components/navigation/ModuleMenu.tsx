import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export type ModuleMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  badge?: string;
};

export type ModuleMenuSection = {
  title?: string;
  items: ModuleMenuItem[];
};

type ModuleMenuProps = {
  visible: boolean;
  onClose: () => void;
  /** Nom du module actif, affiché sous la marque Afroza Campus. */
  moduleLabel: string;
  /** Icône représentant le module (en-tête). */
  moduleIcon?: keyof typeof Ionicons.glyphMap;
  sections: ModuleMenuSection[];
  onLogout?: () => void;
};

const DRAWER_WIDTH = 320;

/**
 * Menu contextuel partagé entre tous les modules (messagerie, actualités,
 * communautés, appels). Même structure et même langage visuel partout ;
 * seules les sections changent selon le module actif.
 */
export default function ModuleMenu({
  visible,
  onClose,
  moduleLabel,
  moduleIcon = 'apps-outline',
  sections,
  onLogout,
}: ModuleMenuProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = React.useState(visible);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) });
      return;
    }
    progress.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.45 }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * -DRAWER_WIDTH }],
  }));

  const handlePress = (item: ModuleMenuItem) => {
    hapticFeedback.selection();
    onClose();
    item.onPress();
  };

  if (!mounted) return null;

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, panelStyle]}>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.brandHeader, { paddingTop: insets.top + theme.spacing.lg }]}
          >
            <View style={styles.brandPattern} />
            <View style={[styles.brandPattern, styles.brandPatternTwo]} />
            <View style={styles.brandRow}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>A</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.brandName}>Afroza Campus</Text>
                <View style={styles.moduleRow}>
                  <Ionicons name={moduleIcon} size={13} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.moduleLabel}>{moduleLabel}</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer le menu"
                hitSlop={theme.accessibility.hitSlop}
                onPress={onClose}
                style={styles.brandClose}
              >
                <Ionicons name="close" size={20} color={theme.colors.white} />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {sections.map((section, sectionIndex) => (
              <View key={section.title ?? `section-${sectionIndex}`} style={styles.section}>
                {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
                {section.items.map((item, index) => (
                  <Animated.View
                    key={item.key}
                    entering={FadeInDown.delay(sectionIndex * 50 + index * 35).duration(220)}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      onPress={() => handlePress(item)}
                      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                    >
                      <View style={[styles.itemIcon, item.destructive && styles.itemIconDanger]}>
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.destructive ? theme.colors.danger : theme.colors.primary}
                        />
                      </View>
                      <Text style={[styles.itemLabel, item.destructive && styles.itemLabelDanger]}>
                        {item.label}
                      </Text>
                      {item.badge ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                      )}
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            ))}
          </ScrollView>

          {onLogout ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Se déconnecter"
              onPress={() => {
                hapticFeedback.medium();
                onClose();
                onLogout();
              }}
              style={({ pressed }) => [
                styles.logout,
                { marginBottom: insets.bottom + theme.spacing.md },
                pressed && styles.itemPressed,
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.textStrong,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.surface,
    borderTopRightRadius: theme.radii.xl,
    borderBottomRightRadius: theme.radii.xl,
    overflow: 'hidden',
    ...theme.shadows.floating,
  },
  brandHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  brandPattern: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  brandPatternTwo: {
    top: 40,
    right: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  brandName: {
    ...theme.typography.title3,
    color: theme.colors.white,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  moduleLabel: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  brandClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  scroll: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  itemPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconDanger: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemLabel: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textStrong,
  },
  itemLabelDanger: {
    color: theme.colors.danger,
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  logoutText: {
    ...theme.typography.label,
    color: theme.colors.danger,
    fontWeight: '700',
  },
});
