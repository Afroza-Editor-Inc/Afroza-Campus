# Changelog — Phase stabilisation frontend mobile

**Période :** juin 2026  
**Objectif :** Expo Doctor 18/18, base production-ready, sans régression fonctionnelle.

---

## 2026-06-05 — Profils & gestion des membres (lot 3)

- **Store** : `addConversationMembers`, `removeConversationMember`, `updateConversationMemberRole` (recalcule `participantIds`, `members`, `memberCount`, sous-titres).
- **Profil collectif** (`ConversationProfileScreen`) :
  - « Ajouter des membres » → modal picker (contacts hors groupe, multi-sélection).
  - Tap sur un membre → action sheet : promouvoir admin / rétrograder, envoyer un message (ouvre/crée la conv directe), retirer du groupe (avec confirmation).
  - Badge propriétaire, libellés de rôles FR, compteur de membres dynamique. Canaux : pas d'ajout (lecture).
- `tsc` ✅ · lint ✅.

---

## 2026-06-05 — Feed Reels (lot 2)

- **`reelsStore`** : 4 reels mock (vidéos d'exemple), actions `toggleLike` / `toggleSave`.
- **`ReelsScreen`** : viewer vertical immersif plein écran type Instagram — pagination verticale snap, autoplay du reel visible et pause des autres (`onViewableItemsChanged`), play/pause au tap, mute, action rail (like/commentaires/partage/enregistrer/son), overlay auteur + légende + audio, bouton suivre, dégradé bas pour lisibilité.
- **Point d'entrée** : bannière « Reels » dans le Feed (après les stories) + bouton caméra dans la barre du viewer (→ création).
- **Navigation** : `Reels` enregistré en `fullScreenModal` (fondu) dans le stack racine.
- `tsc` ✅ · lint ✅.

---

## 2026-06-05 — Picker GIF / Stickers

- **Envoi immédiat** : un GIF ou sticker tapé part directement (UX WhatsApp/Instagram) via la nouvelle prop `onSendAttachment` (`InputBar` → `ChatScreen` → `sendMessage`). Fallback en pièce jointe si la prop est absente.
- **Stickers réparés** : URLs `via.placeholder.com` (service hors-ligne) remplacées par `placehold.co` → images fonctionnelles.
- Bibliothèques enrichies : 6 GIFs + 6 stickers, avec recherche par libellé déjà en place.
- `tsc` ✅ · lint ✅.

---

## 2026-06-05 — Messagerie avancée (lot 1)

- **Transfert** : nouvel écran `ForwardMessageScreen` (modal, multi-sélection de conversations) + action `forwardMessage` dans le store.
- **Suppression** : action `deleteMessage` (store) + confirmation, met à jour l'aperçu de conversation.
- **Menu d'actions message enrichi** (long-press) : Répondre, Transférer, Copier (`expo-clipboard`), Favori (★ toggle), Supprimer — avec style destructif cohérent.
- Réactions rapides emoji déjà branchées sur `toggleMessageReaction` (conservé).
- `tsc` ✅ · lint ✅.

---

## 2026-06-05 — MVP fonctionnel (Appels, Communautés, Feed)

### Module Appels — passage de décoratif à fonctionnel
- `CallsScreen` réécrit : branché sur `callsStore`, tous les boutons fonctionnels (récents → rappel, appel vocal/vidéo, rejoindre meeting, créer conférence, espaces vocaux live).
- Nouvel écran `ActiveCallScreen` (plein écran) : minuteur, micro/vidéo/haut-parleur, raccrocher, design appel premium.
- Nouvel écran `ScheduleMeetingScreen` (modal) : titre, description, créneau, durée, vidéo, écrit dans le store.

### Module Communautés — cœur collaboratif
- Nouvel écran `CommunityDetailScreen` avec onglets : À propos (stats), Projets (tableau Trello-like à colonnes), Ressources (Notion-like), Membres.
- `CommunityCard` et `CollaborationStrip` branchés → navigation vers le détail (onglet contextuel selon le raccourci).

### Feed / Stories
- Nouvel écran `StoryViewerScreen` plein écran 9:16 : barres de progression animées, navigation par tap gauche/droite, barre de réponse.
- `StoriesBar` branché (ma story → création, autres → visionneuse).
- `FeedScreen` : partage natif via `Share`, suppression de la route `Comments` inexistante.

### Navigation
- 4 écrans enregistrés dans le stack racine : `CommunityDetail`, `ActiveCall` + `StoryViewer` (fullScreenModal), `ScheduleMeeting` (modal).

### Qualité
- `tsc --noEmit` ✅ · lint ✅ · aucune couleur arbitraire (design system respecté) · cibles tactiles ≥ 44px · haptique sur les actions clés.

---

## 2026-06-05 — Expo Doctor & infrastructure

### Corrigé

| Problème | Solution | Fichiers |
|----------|----------|----------|
| Metro config non conforme | Ajout `metro.config.js` héritant de `expo/metro-config` | `metro.config.js` |
| `@types/react-native` inutile | Suppression de `devDependencies` | `package.json`, `package-lock.json` |
| Versions SDK patch | `expo` ~54.0.35, `expo-font` ~14.0.12 | `package.json`, `package-lock.json` |
| Clavier Android (chat) | `softwareKeyboardLayoutMode: 'resize'` + `KeyboardAvoidingView` sans `behavior: 'height'` sur Android | `app.config.js`, `ChatScreen.tsx` |
| Perf chat | `renderMessage` / `handleMessageLongPress` mémorisés | `ChatScreen.tsx` |

### Vérifié

- `npx expo-doctor` → **18/18 checks passed** (Node 20 requis)
- `npx tsc --noEmit` → OK

---

## 2026-06-05 — Design system & messagerie (session précédente)

### Corrigé

- Tokens neutres alignés spec Afroza (`#F7F9FC`, `#E8EDF5`, `#A7B1C2`, `#111827`)
- `gradients.bubbleMine`, `accessibility.minTouchTarget` (44pt)
- Gradients bulles chat : `messagingGradient` au lieu de couleurs Google ad hoc
- `InteractivePostCard` : sync `isLiked` / `isSaved` avec le store parent
- `ConversationsScreen` : `renderItem` et séparateur mémorisés
- `PremiumButton` : cible tactile minimale + `accessibilityRole`

### Fichiers touchés

- `src/theme/index.ts`
- `src/modules/messaging/theme.ts`
- `src/modules/messaging/components/MessageBubble.tsx`
- `src/modules/messaging/screens/ChatScreen.tsx`, `MessagingSectionScreen.tsx`, `WallpaperPickerScreen.tsx`, `ConversationsScreen.tsx`
- `src/components/feed/InteractivePostCard.tsx`
- `src/screens/FeedScreen.tsx`
- `src/components/PremiumButton.tsx`

---

## Déjà en place (avant stabilisation)

- `FeedScreen` : `loadFeed` stabilisé (`useCallback`)
- `MagicBottomTab` : deps Reanimated corrigées
- `TypingIndicator` : cleanup `Animated.loop`
- `SplashScreen` : deps limitées à `[navigation]`
- `ChatRoomScreen` (legacy) : `cancelAnimationFrame` sur scroll
- `messagesStore` : alias vers `useMessagingStore` (pas de double store)

---

## Non modifié (volontairement)

- Structure des écrans messagerie
- Navigation `MessagingNavigator` (17 routes)
- Module `src/features/messaging` (legacy, non branché)
- Palette brand Blue → Accent → Green

---

## 2026-06-05 — Phase 2 UX/UI (raffinement)

### Navigation

- Bottom bar : 4 onglets (Messages, Actualités, Communautés, Appels) + FAB centre gradient
- Profil retiré des onglets → stack `Profile` + `UserAvatarButton` dans les headers
- Icônes unifiées (`src/theme/icons.ts`, style Instagram DM / home / videocam)
- `MainActionMenu` : nouvelle discussion, publication, story/reel

### UX globale

- `AppScreenHeader` sur Actualités, Communautés, Appels
- `FloatingAnchorMenu` pour menus ⋮ compacts ancrés à droite
- Messagerie : pièces jointes horizontales, emoji panel inline, bulles/liste affinées

Voir `PHASE2_UX_AUDIT.md`.

### Phase 2 — vague 2

- `StoriesBar` : ring gradient Afroza (vu/non-vu) style Instagram, avatars 58px, haptics
- `SegmentedTabs` : composant d'onglets pilule réutilisable (`theme.typography.label`, badges)
- `CommunitiesScreen` / `CallsScreen` : onglets dupliqués remplacés par `SegmentedTabs`

### Phase 2 — vague 3 (Communautés)

- `CommunityCard` : carte premium réutilisable (avatar gradient, badge non-lus, vérifié, pilule "Rejoindre/Suivre", chevron)
- `CollaborationStrip` : accès rapides Projets / Études / Organisation / Ressources (prépare UX collaboration type Notion/Slack)
- `CommunitiesScreen` réorganisé : hiérarchie "Mes groupes / Suggestions", "Mes canaux / À découvrir", "Mes communautés / Explorer"
- Couleurs 100% via `theme` ; FlatList conservées (sections via Header/Footer)

### Refonte — Actualités (Reels + Publications)

- `ReelsCarousel` : carrousel horizontal d'aperçus Reels (cartes 116×188, gradient + overlay, pastille likes, auteur), remplace l'ancien bouton/bannière dans le feed ; clic ouvre `ReelsScreen` à l'index correspondant (`startIndex`).
- `InteractivePostCard` : menu avancé via `FloatingAnchorMenu` (Partager, Copier le lien, Enregistrer, Republier, Télécharger, Ne plus suivre, Signaler destructif) branché sur le bouton "···".
- `InteractivePostCard` : rendu enrichi du contenu — hashtags `#` et mentions `@` colorés (`theme.colors.primary`).
- `FeedScreen` : nettoyage des imports/styles de l'ancienne bannière Reels.
- `feedStore` : système de commentaires (`comments` par post, `addComment`, `toggleCommentLike`, compteur synchronisé) + données seed.
- `PostCommentsScreen` (modal) : liste des commentaires (avatar, hashtags/mentions colorés, like, temps relatif), champ de saisie avec `KeyboardAvoidingView`, état vide ; ouvert depuis le bouton "Commenter" du feed.

### Refonte — Messagerie (vraies réponses citées)

- `types` : `MessageReplyPreview` + `ChatMessage.replyTo` + `SendMessageInput.replyTo`.
- `useMessagingStore` : `sendMessage` et `buildOutgoingMessage` propagent la citation de réponse.
- `ChatScreen` : "Répondre" crée désormais une vraie réponse — bannière de citation au-dessus de l'`InputBar` (nom + extrait + fermeture), envoyée avec le message (fini le hack markdown `>` dans le brouillon).
- `MessageBubble` : bloc de citation (`ReplyQuote`) rendu en tête de bulle (variantes envoyé/reçu), accent + nom + extrait sur 2 lignes.

### Refonte — Communautés (Kanban & Ressources interactifs)

- `CommunityDetailScreen` : board et ressources passés en état React (plus de constantes figées).
- Kanban (Trello) : créer une tâche par colonne (modal + saisie), déplacer une tâche entre colonnes et la supprimer (modal d'actions au tap), compteurs par colonne live.
- Ressources (Notion) : ajout d'une ressource avec choix de type (Document/Présentation/Fichier/Lien/Note → icône dédiée), suppression, état vide.
- Onglet "À propos" : stats Tâches/Ressources recalculées en direct depuis l'état.

### Refonte — Navigation & création de contenu

- `MainActionMenu` (FAB central) : refonte premium — grille de 3 cartes distinctes Story / Publication / Reel, chacune avec gradient dédié et entrée animée échelonnée (`FadeInDown` spring), + ligne "Nouvelle discussion". Routage par `mode` vers `PostCreate`.
- `PostCreateModal` : exploite le paramètre `mode` (post/story/reel) pour adapter titre, sous-titre, prompt et libellé du CTA — expérience de création cohérente de bout en bout.
- Barre d'onglets `MagicBottomTab` : déjà premium (bulle animée, FAB halo, badges live, indicateur) — conservée.

### Refonte — Iconographie (système unifié)

- `theme/icons.ts` : ajout d'un registre sémantique `glyphs` (source de vérité unique) couvrant navigation, social/feed, messagerie, appels, communautés et création, avec convention documentée (famille unique Ionicons, neutre = `-outline`, actif = plein, "plus" = `ellipsis-horizontal`).
- Unification : `NewChatScreen` (module actif) passe de `ellipsis-vertical` à `ellipsis-horizontal` ; icône de partage du feed alignée sur le style Instagram (`paper-plane-outline`).

### Refonte — Appels (conférence multi-participants & partage d'écran)

- `ActiveCallScreen` : nouveau mode `conference` (params `mode`/`participants`) — grille de tuiles participants (avatar gradient, nom, état micro), titre + compteur de participants.
- Partage d'écran (mock) : bouton de contrôle "Partager / Arrêter" (`desktop-outline` ↔ `stop-circle`) qui affiche une tuile dédiée "Vous partagez votre écran".
- `CallsScreen` : rejoindre un espace conférence ou une réunion (>2 participants) ouvre l'appel en mode conférence.

### Refonte — Profil (style Instagram)

- `ProfileScreen` réécrit : cover dégradé, avatar à anneau gradient, stats en ligne (Publications/Abonnés/Suivis) compactées (formatage k), bio + rôle.
- Highlights (stories à la une) horizontaux, actions Éditer / Partager (partage natif).
- Onglets `SegmentedTabs` Publications / Reels / Enregistrés ; grille 3 colonnes carrée (style Instagram) avec badges contextuels (likes, play+vues, bookmark) ; tap sur un reel ouvre le viewer `Reels`.

### Refonte — Stories (différenciation & transitions)

- `StoriesBar` : types de stories distincts — perso (bouton +), contacts (anneau gradient Instagram vu/non-vu), communautés (avatar carré arrondi, icône `people`, badge communauté). Anneau non-vu passe au dégradé Instagram (or→rose→violet).
- `StoryViewerScreen` : transition animée entre slides (`FadeIn` sur le fond/visuel), en-tête contextuel (nom transmis depuis la barre, avatar carré + badge "Communauté" pour les stories de communauté).

### Nettoyage — suppression du legacy

- Suppression de `src/features/messaging/` (14 fichiers, module non branché). La messagerie active reste `src/modules/messaging`. Aucun import dans le code actif (vérifié).
- Note : `src/components/messaging/` (ConversationListItem) n'est plus importé que par son propre index → mort, candidat à suppression ultérieure.
- Rapport de synthèse complet ajouté : `REFONTE_MVP_REPORT.md`.

---

## Commandes de validation

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd afroza-campus/frontend/mobile
npx expo-doctor          # 18/18
npx tsc --noEmit
npm start
```
