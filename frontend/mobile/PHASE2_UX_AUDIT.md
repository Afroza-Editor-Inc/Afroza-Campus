# PHASE 2 — Audit UX/UI & plan d’harmonisation

**Date :** juin 2026  
**Statut :** implémentation progressive (vague 1 livrée)

---

## 1. Objectif

Passer d’un prototype stable à une expérience **premium** (WhatsApp × Instagram × Telegram) sans refonte destructive.

---

## 2. Écrans audités

| Zone | Écrans | État UX avant | Améliorations vague 1 |
|------|--------|---------------|------------------------|
| Navigation | 4 onglets + FAB | 5 onglets dont Profil | Profil retiré ; FAB centre ; labels FR |
| Messages | 17 routes stack | Déjà mature | Menus ⋮ flottants ; pièces jointes compactes ; emoji inline |
| Actualités | FeedScreen | Header disparate | `AppScreenHeader` + avatar profil |
| Communautés | 3 sous-onglets | Header basique | Header unifié + profil |
| Appels | 3 sous-onglets | Header basique | Header unifié + profil |
| Profil | Stack root | Onglet dédié | Stack `Profile` + retour + accès avatar |

---

## 3. Navigation — nouvelle structure

```
[ Messages ] [ Actualités ]  (+)  [ Communautés ] [ Appels ]
```

- **Messages** — icônes `paper-plane` (style DM Instagram)
- **Actualités** — `home` (feed campus)
- **Centre** — gradient Afroza, menu : discussion / publication / story
- **Communautés** — groupes, canaux, clubs
- **Appels** — `videocam` (préparation Meet / rooms)

**Profil** : `UserAvatarButton` dans les headers → `navigation.navigate('Profile')`.

---

## 4. Design system — extensions

| Token / module | Fichier |
|----------------|---------|
| Iconographie tabs | `src/theme/icons.ts` |
| Menu flottant ancré | `src/components/overlays/FloatingAnchorMenu.tsx` |
| Header écran | `src/components/AppScreenHeader.tsx` |
| Avatar profil | `src/components/UserAvatarButton.tsx` |

Palette inchangée : Blue → Accent → Green.

---

## 5. Messagerie — améliorations (flux conservés)

| Composant | Changement |
|-----------|------------|
| `ConversationItem` | Spacing, badges 22px, radius tokens |
| `MessageBubble` | Bulles plus fines (radius 20, ombre légère) |
| `MessagingAttachmentSheet` | Bandeau horizontal compact (WhatsApp-like) |
| `MessagingSidePanelMenu` | Délègue à `FloatingAnchorMenu` (menu ⋮ premium) |
| `InputBar` | Panneau emoji **inline** (remplace clavier, toggle clavier) |

**Non modifié :** routes, store, logique navigation messagerie.

---

## 6. Micro-interactions

| Interaction | Implémentation |
|-------------|----------------|
| Changement onglet | Bulle spring + haptic selection |
| FAB centre | Scale press + `MainActionMenu` spring |
| Menus ⋮ | Fade + scale panel |
| Pièces jointes | Slide up court |
| Tab items | Press scale 0.94 |

---

## 7. Améliorations proposées — vague 2

| Priorité | Item |
|----------|------|
| P1 | Harmoniser `CommunitiesScreen` / `CallsScreen` (couleurs → theme uniquement) |
| P1 | Chat header : menu ⋮ via `FloatingAnchorMenu` |
| P2 | Stories bar — ratio Instagram 9:16 |
| P2 | Transitions stack profil ↔ feed (fade) |
| P2 | `expo-image` avatars + cache |
| P3 | Reels onglet dans Actualités |
| P3 | Rooms / Meet placeholder dans Appels |

---

## 8. Accessibilité

- Cibles tactiles : FAB 56px, tabs `minTouchTarget` 44, menus 44
- Labels : FAB, avatar profil, retour profil
- Contrastes : labels `textMuted` sur fond `surfaceMuted`

---

## 9. Performance

- Pas de nouvelle dépendance
- Menus montés à la demande (`mounted` + Reanimated)
- Emoji panel inline évite Modal fullscreen (moins de layers)

---

## 10. Validation

```bash
nvm use 20
cd afroza-campus/frontend/mobile
npx tsc --noEmit
npm start
```

Checklist manuelle :

1. 4 onglets + FAB ouvrent le menu création
2. Avatar ouvre Profil, retour OK
3. Messagerie : menu ⋮, pièces jointes, emoji ↔ clavier
4. Aucune régression navigation chat

---

## 11. Fichiers créés / modifiés (vague 1)

**Créés :** `theme/icons.ts`, `FloatingAnchorMenu.tsx`, `MainActionMenu.tsx`, `AppScreenHeader.tsx`, `UserAvatarButton.tsx`, `PHASE2_UX_AUDIT.md`

**Modifiés :** `MagicBottomTab.tsx`, `BottomTabs.tsx`, `App.tsx`, `FeedScreen`, `CommunitiesScreen`, `CallsScreen`, `ProfileScreen`, module messaging (InputBar, AttachmentSheet, SidePanelMenu, ConversationItem, MessageBubble)
