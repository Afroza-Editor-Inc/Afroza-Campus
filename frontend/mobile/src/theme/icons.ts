import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type AfrozaIconName = ComponentProps<typeof Ionicons>['name'];

/** Tab bar — famille moderne style Instagram / TikTok / Threads. */
export const tabIcons = {
  // Messagerie — bulle de discussion moderne
  Messages: {
    active: 'chatbubble-ellipses' as AfrozaIconName,
    inactive: 'chatbubble-ellipses-outline' as AfrozaIconName,
  },
  // Actualités — cadre/écran avec symbole Play (contenu, reels, stories)
  Feed: {
    active: 'play-circle' as AfrozaIconName,
    inactive: 'play-circle-outline' as AfrozaIconName,
  },
  // Communautés — groupes & collaboration
  Communities: {
    active: 'people' as AfrozaIconName,
    inactive: 'people-outline' as AfrozaIconName,
  },
  // Appels — appels, réunions, conférences
  Calls: {
    active: 'call' as AfrozaIconName,
    inactive: 'call-outline' as AfrozaIconName,
  },
} as const;

export const headerIcons = {
  notifications: 'notifications-outline' as AfrozaIconName,
  menu: 'menu-outline' as AfrozaIconName,
  settings: 'settings-outline' as AfrozaIconName,
  search: 'search-outline' as AfrozaIconName,
  more: 'ellipsis-horizontal' as AfrozaIconName,
} as const;

/**
 * Source de vérité sémantique des icônes Afroza Campus.
 *
 * Convention :
 * - Famille unique : Ionicons (aucune autre librairie d'icônes).
 * - État neutre / non actif → variante `-outline`.
 * - État actif / sélectionné / mis en avant → variante pleine.
 * - "Plus d'options" → toujours `ellipsis-horizontal` (jamais vertical).
 *
 * Préférez `glyphs.x` à des chaînes Ionicons brutes dans les nouveaux écrans.
 */
export const glyphs = {
  // Navigation
  back: 'chevron-back' as AfrozaIconName,
  forward: 'chevron-forward' as AfrozaIconName,
  close: 'close' as AfrozaIconName,
  more: 'ellipsis-horizontal' as AfrozaIconName,
  add: 'add' as AfrozaIconName,
  search: 'search-outline' as AfrozaIconName,
  settings: 'settings-outline' as AfrozaIconName,
  notifications: 'notifications-outline' as AfrozaIconName,

  // Social — feed
  like: 'heart-outline' as AfrozaIconName,
  likeActive: 'heart' as AfrozaIconName,
  comment: 'chatbubble-outline' as AfrozaIconName,
  share: 'paper-plane-outline' as AfrozaIconName,
  save: 'bookmark-outline' as AfrozaIconName,
  saveActive: 'bookmark' as AfrozaIconName,
  repost: 'repeat-outline' as AfrozaIconName,
  download: 'download-outline' as AfrozaIconName,
  report: 'flag-outline' as AfrozaIconName,
  link: 'link-outline' as AfrozaIconName,

  // Messagerie
  send: 'arrow-up' as AfrozaIconName,
  reply: 'arrow-undo-outline' as AfrozaIconName,
  forwardMessage: 'arrow-redo-outline' as AfrozaIconName,
  copy: 'copy-outline' as AfrozaIconName,
  star: 'star-outline' as AfrozaIconName,
  starActive: 'star' as AfrozaIconName,
  trash: 'trash-outline' as AfrozaIconName,
  attach: 'add-circle-outline' as AfrozaIconName,
  camera: 'camera-outline' as AfrozaIconName,
  gallery: 'images-outline' as AfrozaIconName,
  document: 'document-text-outline' as AfrozaIconName,
  mic: 'mic-outline' as AfrozaIconName,
  emoji: 'happy-outline' as AfrozaIconName,
  pin: 'pin-outline' as AfrozaIconName,
  pinActive: 'pin' as AfrozaIconName,
  mute: 'volume-mute-outline' as AfrozaIconName,
  archive: 'archive-outline' as AfrozaIconName,
  read: 'checkmark-done' as AfrozaIconName,

  // Appels
  call: 'call-outline' as AfrozaIconName,
  callActive: 'call' as AfrozaIconName,
  video: 'videocam-outline' as AfrozaIconName,
  videoActive: 'videocam' as AfrozaIconName,
  hangup: 'call' as AfrozaIconName,
  speaker: 'volume-high-outline' as AfrozaIconName,
  micOff: 'mic-off-outline' as AfrozaIconName,
  addParticipant: 'person-add-outline' as AfrozaIconName,
  keypad: 'keypad-outline' as AfrozaIconName,
  screenShare: 'phone-portrait-outline' as AfrozaIconName,

  // Communautés / collaboration
  people: 'people-outline' as AfrozaIconName,
  project: 'rocket-outline' as AfrozaIconName,
  resource: 'folder-open-outline' as AfrozaIconName,
  calendar: 'calendar-outline' as AfrozaIconName,
  time: 'time-outline' as AfrozaIconName,
  shield: 'shield-checkmark-outline' as AfrozaIconName,

  // Création
  story: 'aperture-outline' as AfrozaIconName,
  post: 'image-outline' as AfrozaIconName,
  reel: 'film-outline' as AfrozaIconName,
  profile: 'person-circle-outline' as AfrozaIconName,
} as const;

export type GlyphKey = keyof typeof glyphs;

export const iconSizes = {
  tab: 24,
  tabActive: 26,
  header: 24,
  inline: 20,
  compact: 18,
} as const;
