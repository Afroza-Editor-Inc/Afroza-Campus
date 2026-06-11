import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import theme from '../theme';
import { hapticFeedback } from '../utils/haptics';

type ActiveCallParams = {
  ActiveCall: {
    name: string;
    callType?: 'voice' | 'video';
    glyph?: string;
    mode?: 'direct' | 'conference';
    participants?: string[];
  };
};

const TILE_GRADIENTS: Array<readonly [string, string]> = [
  ['#0072FF', '#00A3FF'],
  ['#00A3FF', '#00FF6A'],
  ['#00C557', '#80FF00'],
  ['#0072FF', '#00FF6A'],
  ['#13B0C9', '#0072FF'],
  ['#00A3FF', '#80FF00'],
];

const DEFAULT_CONFERENCE = ['Awa Diop', 'Sékou Traoré', 'Lina Cohen', 'Tom Bernard'];

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function ActiveCallScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ActiveCallParams, 'ActiveCall'>>();
  const { name, callType = 'voice', glyph, mode, participants } = route.params ?? { name: 'Appel' };

  const isConference = mode === 'conference' || (participants?.length ?? 0) > 0;
  const conferenceMembers = React.useMemo(
    () => ['Vous', ...(participants && participants.length > 0 ? participants : DEFAULT_CONFERENCE)],
    [participants]
  );

  const [elapsed, setElapsed] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [speaker, setSpeaker] = React.useState(callType === 'video' || isConference);
  const [videoOn, setVideoOn] = React.useState(callType === 'video');
  const [screenSharing, setScreenSharing] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const endCall = () => {
    hapticFeedback.error();
    navigation.goBack();
  };

  const initial = (glyph ?? name?.[0] ?? '?').toUpperCase();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B1220', '#0F2A4A', '#0B1220']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réduire"
            hitSlop={theme.accessibility.hitSlop}
            onPress={() => navigation.goBack()}
            style={styles.topButton}
          >
            <Ionicons name="chevron-down" size={26} color={theme.colors.white} />
          </Pressable>
          <View style={styles.encrypted}>
            <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.encryptedText}>Chiffré de bout en bout</Text>
          </View>
          <View style={styles.topButton} />
        </View>

        {isConference ? (
          <View style={styles.conference}>
            <Text style={styles.confTitle} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.status}>
              {conferenceMembers.length} participants · {formatTimer(elapsed)}
            </Text>

            {screenSharing ? (
              <View style={styles.screenShareTile}>
                <Ionicons name="desktop-outline" size={34} color={theme.colors.white} />
                <Text style={styles.screenShareText}>Vous partagez votre écran</Text>
              </View>
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.grid}
            >
              {conferenceMembers.map((member, index) => (
                <Animated.View
                  key={`${member}-${index}`}
                  entering={FadeInDown.delay(index * 70).duration(320)}
                  style={styles.tile}
                >
                  <LinearGradient
                    colors={TILE_GRADIENTS[index % TILE_GRADIENTS.length]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.tileAvatar}>
                    <Text style={styles.tileAvatarText}>{member[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.tileFooter}>
                    <Text style={styles.tileName} numberOfLines={1}>
                      {member}
                    </Text>
                    <Ionicons
                      name={index === 0 && muted ? 'mic-off' : 'mic'}
                      size={13}
                      color={theme.colors.white}
                    />
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(360)} style={styles.identity}>
            <PulsingAvatar initial={initial} />
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.status}>
              {callType === 'video' ? 'Appel vidéo' : 'Appel audio'} · {formatTimer(elapsed)}
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.controls}>
          <View style={styles.controlRow}>
            <ControlButton
              icon={muted ? 'mic-off' : 'mic'}
              label={muted ? 'Muet' : 'Micro'}
              active={muted}
              onPress={() => {
                hapticFeedback.selection();
                setMuted((value) => !value);
              }}
            />
            <ControlButton
              icon={videoOn ? 'videocam' : 'videocam-off'}
              label="Vidéo"
              active={videoOn}
              onPress={() => {
                hapticFeedback.selection();
                setVideoOn((value) => !value);
              }}
            />
            <ControlButton
              icon={speaker ? 'volume-high' : 'volume-medium'}
              label="Haut-parleur"
              active={speaker}
              onPress={() => {
                hapticFeedback.selection();
                setSpeaker((value) => !value);
              }}
            />
          </View>

          <View style={styles.controlRow}>
            <ControlButton icon="chatbubble-ellipses" label="Message" onPress={() => navigation.goBack()} />
            <ControlButton icon="person-add" label="Ajouter" onPress={hapticFeedback.light} />
            <ControlButton
              icon={screenSharing ? 'stop-circle' : 'desktop-outline'}
              label={screenSharing ? 'Arrêter' : 'Partager'}
              active={screenSharing}
              onPress={() => {
                hapticFeedback.selection();
                setScreenSharing((value) => !value);
              }}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Raccrocher"
            onPress={endCall}
            style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
          >
            <Ionicons name="call" size={30} color={theme.colors.white} />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}
    >
      <View style={[styles.controlIcon, active && styles.controlIconActive]}>
        <Ionicons
          name={icon}
          size={24}
          color={active ? theme.colors.textStrong : theme.colors.white}
        />
      </View>
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

function PulsingAvatar({ initial }: { initial: string }) {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.35 }],
    opacity: 0.5 - pulse.value * 0.5,
  }));

  return (
    <View style={styles.avatarWrap}>
      <Animated.View style={[styles.avatarPulse, ringStyle]} />
      <LinearGradient
        colors={theme.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Text style={styles.avatarGlyph}>{initial}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  topButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encrypted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  encryptedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  identity: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
  },
  conference: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  confTitle: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  screenShareTile: {
    marginTop: theme.spacing.sm,
    height: 120,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(0,114,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(0,163,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  screenShareText: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  tile: {
    width: '48.5%',
    height: 150,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
  },
  tileAvatar: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  tileAvatarText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tileName: {
    flex: 1,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  avatarWrap: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPulse: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    color: theme.colors.white,
    fontSize: 48,
    fontWeight: '800',
  },
  name: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginTop: theme.spacing.sm,
  },
  status: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  control: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    width: 88,
  },
  controlPressed: {
    opacity: 0.7,
  },
  controlIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconActive: {
    backgroundColor: theme.colors.white,
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  endButton: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
    marginTop: theme.spacing.sm,
  },
  endButtonPressed: {
    opacity: 0.85,
    transform: [{ rotate: '135deg' }, { scale: 0.95 }],
  },
});
