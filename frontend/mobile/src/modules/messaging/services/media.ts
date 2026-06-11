import * as MediaLibrary from 'expo-media-library';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { MessageAttachment, MessagingContact } from '../types';
import { formatBytes, formatDuration } from './formatters';

function assetKind(asset: ImagePickerAsset): MessageAttachment['type'] {
  if (asset.type === 'video') {
    return 'video';
  }

  return 'image';
}

export function createAttachmentFromAsset(asset: ImagePickerAsset): MessageAttachment {
  const kind = assetKind(asset);
  const fileName = asset.fileName ?? (kind === 'video' ? 'Capture video' : 'Capture photo');

  return {
    id: `${kind}_${Date.now()}`,
    type: kind,
    label: fileName,
    uri: asset.uri,
    mimeType: asset.mimeType,
    sizeBytes: asset.fileSize,
    sizeLabel: formatBytes(asset.fileSize),
    durationMs: asset.duration ?? undefined,
    durationLabel: asset.duration ? formatDuration(asset.duration) : undefined,
  };
}

export function createDocumentAttachment(label = 'Afroza-brief.pdf', sizeBytes = 2_400_000) {
  return {
    id: `document_${Date.now()}`,
    type: 'document' as const,
    label,
    sizeBytes,
    sizeLabel: formatBytes(sizeBytes),
    accentColor: '#0072FF',
  };
}

export function createContactAttachment(contact: MessagingContact): MessageAttachment {
  return {
    id: `contact_${Date.now()}`,
    type: 'contact',
    label: contact.name,
    contactId: contact.id,
    accentColor: contact.avatarColor,
  };
}

export function createLocationAttachment(label = 'Douala Campus - Salle Innovation'): MessageAttachment {
  return {
    id: `location_${Date.now()}`,
    type: 'location',
    label,
    accentColor: '#F59E0B',
  };
}

export function createVoiceAttachment({
  durationMs,
  sizeBytes,
  uri,
}: {
  durationMs: number;
  sizeBytes?: number;
  uri?: string;
}): MessageAttachment {
  return {
    id: `audio_${Date.now()}`,
    type: 'audio',
    label: 'Voice note',
    uri,
    durationMs,
    durationLabel: formatDuration(durationMs),
    sizeBytes,
    sizeLabel: formatBytes(sizeBytes),
    accentColor: '#00FF6A',
  };
}

export async function trySaveMediaToLibrary(uri?: string) {
  if (!uri) {
    return false;
  }

  try {
    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      return false;
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch (error) {
    return false;
  }
}
