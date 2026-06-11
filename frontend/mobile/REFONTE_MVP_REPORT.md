# Rapport de synthèse — Refonte MVP frontend mobile Afroza Campus

_Dernière mise à jour : refonte UI/UX inspirée TokTok + unification palette Afroza._

Afroza Campus = super app étudiante fusionnant WhatsApp (messagerie), Instagram
(feed/stories/reels), Telegram (communautés/canaux), Discord (conférences),
Google Meet (réunions), Trello (tâches) et Notion (ressources).

Stack : React Native, Expo SDK 54, TypeScript, Zustand, React Navigation,
Reanimated, expo-av, expo-linear-gradient.

---

## 1. Modules refondus

### Messagerie
- Liste des conversations déjà au niveau MVP (recherche, `FilterTabs`, statuts,
  action sheet épingler/favori/sourdine/archiver/supprimer, aperçu d'avatar).
- **Réponses citées réelles** (nouveau) : `MessageReplyPreview` dans les types,
  propagation `sendMessage`/`buildOutgoingMessage`, bannière de citation au-dessus
  de l'`InputBar`, bloc cité (`ReplyQuote`) en tête de bulle (envoyé/reçu).
- Réactions emoji, transfert, copie, favori, suppression : opérationnels.
- GIF/stickers : envoi instantané.

### Actualités (feed)
- **Stories** : types différenciés perso / contacts (anneau dégradé Instagram
  vu/non-vu) / communautés (avatar carré + badge). Viewer avec transition `FadeIn`
  et en-tête contextuel.
- **Reels** : `ReelsCarousel` (aperçus horizontaux) → viewer vertical immersif
  `ReelsScreen` (autoplay, mute, actions, ouverture à l'index tapé).
- **Publications** : menu avancé (`FloatingAnchorMenu` : partager, copier le lien,
  enregistrer, republier, télécharger, ne plus suivre, signaler), rendu
  hashtags/mentions colorés, **commentaires fonctionnels** (`feedStore.comments`,
  `addComment`, `toggleCommentLike`, `PostCommentsScreen`).

### Communautés
- `CommunityDetailScreen` : hero, actions, onglets À propos / Projets / Ressources / Membres.
- **Kanban interactif (Trello)** : créer / déplacer / supprimer des tâches (état React,
  compteurs live).
- **Ressources interactives (Notion)** : ajouter (avec type + icône) / supprimer,
  état vide.

### Appels
- `ActiveCallScreen` 1-à-1 (audio/vidéo, mute, speaker, vidéo, raccrocher).
- **Conférence multi-participants** : grille de tuiles participants, compteur, timer.
- **Partage d'écran (mock)** : bouton Partager/Arrêter + tuile dédiée.
- `ScheduleMeetingScreen`, `CallsScreen` (récents/appels/réunions/conférences) câblés
  sur `useCallsStore`.

### Profil
- Refonte style Instagram : cover dégradé, avatar à anneau, stats compactes,
  bio, highlights, onglets `SegmentedTabs` (Publications/Reels/Enregistrés),
  grille 3 colonnes carrée, tap reel → viewer Reels, partage natif.

### Navigation & création
- `MagicBottomTab` premium (bulle animée, FAB halo, badges live, indicateur) :
  Messages · Actualités · ( + ) · Communautés · Appels.
- **FAB central refondu** : grille 3 cartes Story / Publication / Reel (gradients
  Afroza distincts, entrée animée échelonnée) + section « Démarrer » couvrant les
  **7 types de création** : discussion, groupe, communauté, réunion.
  Toutes les destinations sont des routes réelles vérifiées.
- `PostCreateModal` adapté au `mode` (titre/sous-titre/prompt/CTA cohérents).

### Flux d'entrée (inspiré TokTok)
- `SplashScreen` (logo gradient Afroza, pétales, loader animé), `OnboardingScreen`
  (illustrations + carte d'action), `WelcomeScreen` (logins sociaux mockés).
- Auth dédiée : `SignInScreen`, `SignUpScreen`, `ForgotPasswordScreen` (SMS/email),
  `OtpScreen` (4 cases auto-avance + compte à rebours), `NewPasswordScreen`.
- Création de profil en 3 étapes : `ProfileSetupScreen` (pays/établissement/faculté/
  filière/niveau via `SelectField`), `ProfileDetailsScreen` (photo/bio/intérêts),
  `FriendSuggestionsScreen` (catégories de suggestions + suivre).

### Iconographie
- Famille unique Ionicons + **registre sémantique `glyphs`** (source de vérité)
  avec convention documentée (neutre `-outline`, actif plein, « plus » =
  `ellipsis-horizontal`).
- Unifications visibles (NewChat, partage feed en `paper-plane`).

### Design system — palette unifiée (mandat strict)
- **Palette 100% Afroza** : bleu (`#0072FF`), cyan (`#00A3FF`), vert (`#00FF6A`).
  Tous les hex violet/rose/orange hors-palette ont été éliminés (vérifié par `grep`).
- Variantes de dégradés on-brand réutilisables : `gradients.ocean` (bleu→cyan),
  `gradients.mint` (cyan→vert), `gradients.aqua` (bleu→vert), en plus de `brand`.
- Surfaces harmonisées : anneau de stories, posters Reels (carousel + viewer),
  tuiles de conférence, cartes du menu « + », communautés à la une, avatars de
  suggestions, anneau d'avatar du profil.
- Rayons / espacements / typographies / ombres centralisés dans `theme/index.ts`.

---

## 2. Nettoyage

- **Supprimé** : `src/features/messaging/` (14 fichiers legacy, module non branché,
  aucun import dans le code actif). La messagerie active est `src/modules/messaging`.
- **Candidat restant** : `src/components/messaging/` (`ConversationListItem`) n'est
  plus importé que par son propre `index.ts` → mort, supprimable lors d'un prochain
  nettoyage (laissé en place, hors périmètre de cette passe).

---

## 3. QA finale

| Vérification | Résultat |
| --- | --- |
| Lint (fichiers refondus) | ✅ Aucune erreur |
| Routes ciblées enregistrées (`PostComments`, `Reels`, `StoryViewer`, `ActiveCall`, `ScheduleMeeting`, `CommunityDetail`, `PostCreate`, `Settings`) | ✅ |
| Références au dossier legacy supprimé | ✅ Aucune dans le code (.ts/.tsx) |
| Imports `features/messaging` restants | ✅ Aucun |

> ⚠️ **Non vérifié dans cet environnement** : `node_modules` n'est pas installé,
> donc `tsc --noEmit`, `expo-doctor` et le bundling Metro n'ont pas pu être exécutés.
> À lancer côté développeur avant tests utilisateurs.

### Commandes de validation recommandées
```bash
source ~/.nvm/nvm.sh && nvm use 20
cd afroza-campus/frontend/mobile
npm install
npx tsc --noEmit
npx expo-doctor
npm start
```

---

## 4. Limites connues (MVP)

- Données en mémoire (mock) pour feed, reels, communautés, appels : pas de backend.
- Téléchargement / signalement / republication : feedback haptique sans pipeline réel.
- Partage d'écran et RTC : maquette visuelle (à brancher sur WebRTC).
- Listes de participants de conférence : jeu de données par défaut si non fourni.
