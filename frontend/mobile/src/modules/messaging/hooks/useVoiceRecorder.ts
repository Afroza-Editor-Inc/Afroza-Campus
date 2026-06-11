import React from 'react';
import { Audio } from 'expo-av';
import { createVoiceAttachment } from '../services/media';
import { formatDuration } from '../services/formatters';
import type { MessageAttachment } from '../types';

export function useVoiceRecorder() {
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [durationMs, setDurationMs] = React.useState(0);

  const clearTicker = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRecording = React.useCallback(async () => {
    if (isRecording) {
      return false;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setDurationMs(0);
      setIsRecording(true);
      clearTicker();
      intervalRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 250);

      return true;
    } catch (error) {
      clearTicker();
      recordingRef.current = null;
      setIsRecording(false);
      setDurationMs(0);
      return false;
    }
  }, [clearTicker, isRecording]);

  const stopRecording = React.useCallback(async (): Promise<MessageAttachment | null> => {
    const recording = recordingRef.current;

    if (!recording) {
      return null;
    }

    clearTicker();
    recordingRef.current = null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI() ?? undefined;
      const nextDuration = Math.max(durationMs, Date.now() - startTimeRef.current);

      setIsRecording(false);
      setDurationMs(0);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return createVoiceAttachment({
        durationMs: nextDuration,
        uri,
      });
    } catch (error) {
      setIsRecording(false);
      setDurationMs(0);
      return null;
    }
  }, [clearTicker, durationMs]);

  const cancelRecording = React.useCallback(async (): Promise<void> => {
    const recording = recordingRef.current;
    clearTicker();
    recordingRef.current = null;
    setIsRecording(false);
    setDurationMs(0);

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error) {
      // ignored: recording discarded
    }
  }, [clearTicker]);

  React.useEffect(
    () => () => {
      clearTicker();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
      }
    },
    [clearTicker]
  );

  return {
    isRecording,
    recordingDurationMs: durationMs,
    recordingDurationLabel: formatDuration(durationMs),
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

