import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  type CameraType,
  type FlashMode,
} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { ResizeMode, Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EmojiPicker from 'rn-emoji-keyboard';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../../../theme';
import { hapticFeedback } from '../../../utils/haptics';
import { useMessagingStore } from '../store/useMessagingStore';
import { formatBytes, formatDuration } from '../services/formatters';
import { trySaveMediaToLibrary } from '../services/media';
import type { MessagingStackParamList } from '../navigation/MessagingNavigator';
import type { MessageAttachment } from '../types';

type Props = NativeStackScreenProps<MessagingStackParamList, 'MessagingCamera'>;

type CapturedMedia = {
  uri: string;
  type: 'image' | 'video';
  durationMs?: number;
  width?: number;
  height?: number;
  fromLibrary?: boolean;
};

const FLASH_SEQUENCE: FlashMode[] = ['off', 'auto', 'on'];

function flashIcon(flash: FlashMode): keyof typeof Ionicons.glyphMap {
  if (flash === 'on') {
    return 'flash';
  }

  if (flash === 'auto') {
    return 'flash-outline';
  }

  return 'flash-off';
}

function RecordingPulse() {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      false
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 1]),
  }));

  return <Animated.View style={[styles.recordingDot, style]} />;
}

export default function CameraScreen({ route, navigation }: Props) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();
  const sendMessage = useMessagingStore((state) => state.sendMessage);

  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  const cameraRef = React.useRef<CameraView>(null);
  const [facing, setFacing] = React.useState<CameraType>('back');
  const [flash, setFlash] = React.useState<FlashMode>('off');
  const [torch, setTorch] = React.useState(false);
  const [mode, setMode] = React.useState<'picture' | 'video'>('picture');
  const [isReady, setIsReady] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [locked, setLocked] = React.useState(false);
  const [recordSeconds, setRecordSeconds] = React.useState(0);
  const [zoomState, setZoomState] = React.useState(0);
  const [recents, setRecents] = React.useState<MediaLibrary.Asset[]>([]);
  const [captured, setCaptured] = React.useState<CapturedMedia | null>(null);
  const [caption, setCaption] = React.useState('');
  const [emojiOpen, setEmojiOpen] = React.useState(false);

  const shouldStartRef = React.useRef(false);
  const lockedRef = React.useRef(false);
  const isRecordingRef = React.useRef(false);
  const baseZoom = useSharedValue(0);
  const zoomSV = useSharedValue(0);

  // Carrousel galerie récente (photos + vidéos du téléphone).
  React.useEffect(() => {
    let active = true;

    (async () => {
      const perm = await MediaLibrary.requestPermissionsAsync();

      if (!perm.granted || !active) {
        return;
      }

      const page = await MediaLibrary.getAssetsAsync({
        first: 40,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      });

      if (active) {
        setRecents(page.assets);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Timer d'enregistrement vidéo.
  React.useEffect(() => {
    if (!isRecording) {
      setRecordSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const resetRecordingState = React.useCallback(() => {
    isRecordingRef.current = false;
    lockedRef.current = false;
    shouldStartRef.current = false;
    setIsRecording(false);
    setLocked(false);
    setMode('picture');
  }, []);

  const recordVideo = React.useCallback(async () => {
    if (!microphonePermission?.granted) {
      await requestMicrophonePermission();
    }

    try {
      const result = await cameraRef.current?.recordAsync({ maxDuration: 60 });

      if (result?.uri) {
        setCaptured({ uri: result.uri, type: 'video' });
      }
    } catch (error) {
      // enregistrement interrompu / annulé
    } finally {
      resetRecordingState();
    }
  }, [microphonePermission?.granted, requestMicrophonePermission, resetRecordingState]);

  React.useEffect(() => {
    if (mode === 'video' && shouldStartRef.current) {
      shouldStartRef.current = false;
      recordVideo();
    }
  }, [mode, recordVideo]);

  const takePhoto = React.useCallback(async () => {
    if (!isReady || isRecordingRef.current) {
      return;
    }

    hapticFeedback.medium();

    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });

      if (photo?.uri) {
        setCaptured({
          uri: photo.uri,
          type: 'image',
          width: photo.width,
          height: photo.height,
        });
      }
    } catch (error) {
      // capture impossible
    }
  }, [isReady]);

  const startVideo = React.useCallback(() => {
    if (!isReady || isRecordingRef.current) {
      return;
    }

    hapticFeedback.strong();
    isRecordingRef.current = true;
    lockedRef.current = false;
    setLocked(false);
    setIsRecording(true);
    shouldStartRef.current = true;
    setMode('video');
  }, [isReady]);

  const stopVideo = React.useCallback(() => {
    if (!isRecordingRef.current) {
      return;
    }

    cameraRef.current?.stopRecording();
  }, []);

  const lockRecording = React.useCallback(() => {
    if (!isRecordingRef.current || lockedRef.current) {
      return;
    }

    hapticFeedback.selection();
    lockedRef.current = true;
    setLocked(true);
  }, []);

  const handleShutterRelease = React.useCallback(() => {
    if (lockedRef.current) {
      return;
    }

    stopVideo();
  }, [stopVideo]);

  const tapGesture = React.useMemo(
    () => Gesture.Tap().maxDuration(260).onEnd(() => runOnJS(takePhoto)()),
    [takePhoto]
  );

  const longPressGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(280)
        .onStart(() => runOnJS(startVideo)())
        .onUpdate((event) => {
          if (event.translationY < -70) {
            runOnJS(lockRecording)();
          }
        })
        .onEnd(() => runOnJS(handleShutterRelease)()),
    [handleShutterRelease, lockRecording, startVideo]
  );

  const shutterGesture = React.useMemo(
    () => Gesture.Race(longPressGesture, tapGesture),
    [longPressGesture, tapGesture]
  );

  const pinchGesture = React.useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          const next = Math.min(Math.max(baseZoom.value + (event.scale - 1) * 0.35, 0), 1);
          zoomSV.value = next;
          runOnJS(setZoomState)(next);
        })
        .onEnd(() => {
          baseZoom.value = zoomSV.value;
        }),
    [baseZoom, zoomSV]
  );

  const toggleFacing = React.useCallback(() => {
    hapticFeedback.selection();
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const cycleFlash = React.useCallback(() => {
    hapticFeedback.selection();
    setFlash((current) => {
      const index = FLASH_SEQUENCE.indexOf(current);
      return FLASH_SEQUENCE[(index + 1) % FLASH_SEQUENCE.length];
    });
  }, []);

  const openLibrary = React.useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCaptured({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        durationMs: asset.duration ?? undefined,
        width: asset.width,
        height: asset.height,
        fromLibrary: true,
      });
    }
  }, []);

  const selectRecent = React.useCallback(async (asset: MediaLibrary.Asset) => {
    hapticFeedback.light();

    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset);
      setCaptured({
        uri: info.localUri ?? asset.uri,
        type: asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'image',
        durationMs: asset.duration ? asset.duration * 1000 : undefined,
        width: asset.width,
        height: asset.height,
        fromLibrary: true,
      });
    } catch (error) {
      setCaptured({
        uri: asset.uri,
        type: asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'image',
        fromLibrary: true,
      });
    }
  }, []);

  const retake = React.useCallback(() => {
    setCaptured(null);
    setCaption('');
  }, []);

  const sendCaptured = React.useCallback(async () => {
    if (!captured) {
      return;
    }

    if (!captured.fromLibrary) {
      await trySaveMediaToLibrary(captured.uri);
    }

    const attachment: MessageAttachment = {
      id: `${captured.type}_${Date.now()}`,
      type: captured.type,
      label: captured.type === 'video' ? 'Vidéo' : 'Photo',
      uri: captured.uri,
      durationMs: captured.durationMs,
      durationLabel: captured.durationMs ? formatDuration(captured.durationMs) : undefined,
      sizeLabel: formatBytes(undefined),
    };

    sendMessage({
      conversationId,
      text: caption.trim() || undefined,
      attachments: [attachment],
    });

    navigation.goBack();
  }, [caption, captured, conversationId, navigation, sendMessage]);

  if (!permission) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.white} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={42} color={theme.colors.white} />
          <Text style={styles.permissionTitle}>Caméra Afroza Campus</Text>
          <Text style={styles.permissionText}>
            Autorisez l'accès à la caméra pour prendre des photos et vidéos dans vos discussions.
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
          </Pressable>
          <Pressable style={styles.permissionGhost} onPress={() => navigation.goBack()}>
            <Text style={styles.permissionGhostText}>Annuler</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pinchGesture}>
        <View style={StyleSheet.absoluteFill}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
            enableTorch={torch && facing === 'back'}
            mode={mode}
            zoom={zoomState}
            onCameraReady={() => setIsReady(true)}
          />
        </View>
      </GestureDetector>

      {/* HAUT : fermer / flash / torche */}
      <View style={[styles.topBar, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable style={styles.glassButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={24} color={theme.colors.white} />
        </Pressable>

        {isRecording ? (
          <View style={styles.recordingPill}>
            <RecordingPulse />
            <Text style={styles.recordingTime}>{formatDuration(recordSeconds * 1000)}</Text>
          </View>
        ) : (
          <View style={styles.brandPill}>
            <Ionicons name="sparkles" size={14} color={theme.colors.white} />
            <Text style={styles.brandText}>Caméra Afroza</Text>
          </View>
        )}

        <View style={styles.topRight}>
          <Pressable style={styles.glassButton} onPress={cycleFlash} hitSlop={8}>
            <Ionicons name={flashIcon(flash)} size={20} color={theme.colors.white} />
          </Pressable>
          <Pressable
            style={[styles.glassButton, torch && styles.glassButtonActive]}
            onPress={() => {
              hapticFeedback.selection();
              setTorch((current) => !current);
            }}
            hitSlop={8}
          >
            <Ionicons name="bulb-outline" size={20} color={theme.colors.white} />
          </Pressable>
        </View>
      </View>

      {zoomState > 0.02 ? (
        <View style={styles.zoomBadge} pointerEvents="none">
          <Text style={styles.zoomText}>{`${(1 + zoomState * 9).toFixed(1)}x`}</Text>
        </View>
      ) : null}

      {locked ? (
        <Animated.View entering={FadeIn} style={[styles.lockedBadge, { top: insets.top + 64 }]}>
          <Ionicons name="lock-closed" size={14} color={theme.colors.white} />
          <Text style={styles.lockedText}>Enregistrement verrouillé</Text>
        </Animated.View>
      ) : null}

      {/* BAS : galerie récente + contrôles */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.9)']}
        style={[styles.bottomArea, { paddingBottom: insets.bottom + theme.spacing.md }]}
      >
        {!isRecording && recents.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRow}
          >
            {recents.map((asset) => (
              <Pressable key={asset.id} onPress={() => selectRecent(asset)} style={styles.recentThumb}>
                <Image source={{ uri: asset.uri }} style={styles.recentImage} />
                {asset.mediaType === MediaLibrary.MediaType.video ? (
                  <View style={styles.recentVideoBadge}>
                    <Ionicons name="videocam" size={12} color={theme.colors.white} />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.controlsRow}>
          <Pressable style={styles.sideButton} onPress={openLibrary} disabled={isRecording}>
            <Ionicons name="images" size={24} color={theme.colors.white} />
            <Text style={styles.sideLabel}>Galerie</Text>
          </Pressable>

          <GestureDetector gesture={shutterGesture}>
            <View style={styles.shutterWrap}>
              <View style={[styles.shutterOuter, isRecording && styles.shutterOuterRecording]}>
                <View style={[styles.shutterInner, isRecording && styles.shutterInnerRecording]} />
              </View>
            </View>
          </GestureDetector>

          <Pressable style={styles.sideButton} onPress={toggleFacing} disabled={isRecording}>
            <Ionicons name="camera-reverse" size={26} color={theme.colors.white} />
            <Text style={styles.sideLabel}>Retourner</Text>
          </Pressable>
        </View>

        <Text style={styles.hintText}>
          {isRecording
            ? locked
              ? 'Appuyez sur le déclencheur pour arrêter'
              : 'Relâchez pour arrêter · glissez vers le haut pour verrouiller'
            : 'Touchez pour une photo · maintenez pour une vidéo'}
        </Text>
      </LinearGradient>

      {locked && isRecording ? (
        <Pressable
          style={[styles.stopButton, { bottom: insets.bottom + 130 }]}
          onPress={stopVideo}
        >
          <Ionicons name="stop" size={26} color={theme.colors.white} />
        </Pressable>
      ) : null}

      {/* APRÈS CAPTURE : prévisualisation + envoi */}
      {captured ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.previewRoot}>
          {captured.type === 'video' ? (
            <Video
              source={{ uri: captured.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              useNativeControls={false}
            />
          ) : (
            <Image source={{ uri: captured.uri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
          )}

          <View style={[styles.previewTop, { paddingTop: insets.top + theme.spacing.sm }]}>
            <Pressable style={styles.glassButton} onPress={retake} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </Pressable>
            <View style={styles.previewTopRight}>
              <Pressable style={styles.glassButton} onPress={retake} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.white} />
              </Pressable>
              <Pressable style={styles.glassButton} onPress={() => setEmojiOpen(true)} hitSlop={8}>
                <Ionicons name="happy-outline" size={20} color={theme.colors.white} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.previewBottom, { paddingBottom: insets.bottom + theme.spacing.md }]}>
            <View style={styles.captionRow}>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Ajouter une légende..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={styles.captionInput}
                multiline
              />
            </View>

            <View style={styles.previewActions}>
              <Pressable style={styles.retakeButton} onPress={retake}>
                <Ionicons name="refresh" size={18} color={theme.colors.white} />
                <Text style={styles.retakeText}>Reprendre</Text>
              </Pressable>

              <Pressable style={styles.sendButton} onPress={sendCaptured}>
                <Text style={styles.sendText}>Envoyer</Text>
                <Ionicons name="send" size={18} color={theme.colors.white} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ) : null}

      <EmojiPicker
        open={emojiOpen}
        onClose={() => setEmojiOpen(false)}
        onEmojiSelected={(emoji) => setCaption((current) => `${current}${emoji.emoji}`)}
        enableSearchBar
        categoryPosition="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionWrap: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  permissionCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    maxWidth: 340,
  },
  permissionTitle: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  permissionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  permissionButton: {
    marginTop: theme.spacing.sm,
    minHeight: 50,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  permissionGhost: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionGhostText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassButtonActive: {
    backgroundColor: 'rgba(255,196,0,0.35)',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  brandText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  recordingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  recordingTime: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  zoomBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 220,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  lockedBadge: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,114,255,0.85)',
  },
  lockedText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  recentRow: {
    paddingHorizontal: theme.spacing.md,
    gap: 8,
  },
  recentThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentVideoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
  },
  sideButton: {
    width: 64,
    alignItems: 'center',
    gap: 4,
  },
  sideLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  shutterWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRecording: {
    borderColor: 'rgba(255,59,48,0.9)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.white,
  },
  shutterInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  hintText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  stopButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  previewTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTopRight: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  previewBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  captionRow: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
  },
  captionInput: {
    color: theme.colors.white,
    fontSize: 15,
    paddingVertical: 12,
    maxHeight: 100,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  retakeText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
  },
  sendText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
