# PROJECT_HEALTH_REPORT — Afroza Campus Mobile

**Date :** 5 juin 2026  
**Chemin :** `afroza-campus/frontend/mobile`  
**Expo Doctor :** 18/18 (Node 20.x)  
**TypeScript :** `tsc --noEmit` OK

---

## 1. Résumé exécutif

Le projet est **fonctionnel et compilable**. La messagerie (`src/modules/messaging`) est le module le plus mature. La dette principale concerne du **code legacy non branché**, des **écrans orphelins** et l’**absence de FlashList** sur les longues listes — sans bloquer la production immédiate sur Expo Go / Dev Build.

| Indicateur | Score | Commentaire |
|------------|-------|-------------|
| Stabilité build | 🟢 | Expo 54.0.35, Metro conforme |
| Typage | 🟢 | `strict: true` |
| Architecture messagerie | 🟢 | Module isolé + stack dédiée |
| Cohérence design | 🟡 | Thème global OK ; quelques hex locaux en dark mode messaging |
| Performance | 🟡 | FlatList optimisée ; pas de FlashList |
| Tests automatisés | 🔴 | Detox config présent ; couverture limitée |
| Deep linking | 🔴 | Non configuré sur `MessagingNavigator` |

---

## 2. Stack & environnement

| Package | Version |
|---------|---------|
| expo | ~54.0.35 |
| react-native | 0.81.5 |
| react | 19.1.0 |
| react-navigation | 6.x |
| reanimated | ~4.1.1 |
| gesture-handler | ~2.28.0 |
| zustand | ^4.4.0 |

**Node :** 20.x obligatoire (`scripts/ensure-node.js`, `.nvmrc`).

**Non utilisé (spec vs réalité) :** Expo Router, React Query.

---

## 3. Architecture navigation

```
App.tsx
├── Stack: Splash → Onboarding → Auth → MainTabs
├── ChatRoom (wrapper legacy stack root)
├── Notifications
└── Modals: PostCreate, Settings

MainTabs (MagicBottomTab)
├── Messages → MessagingNavigator (17 écrans)
├── Feed, Communities, Calls, Profile
```

**Risques faibles :** `ChatRoom` existe à la fois dans le stack root (`App.tsx`) et dans `MessagingNavigator` (`Chat`). Le wrapper `screens/ChatRoom.tsx` réinjecte `conversationId` — comportement documenté, pas de conflit si navigation cohérente.

---

## 4. Dette technique

### 4.1 Code legacy — `src/features/messaging/` (~15 fichiers)

| Statut | Détail |
|--------|--------|
| Branché en prod | **Non** — aucun import depuis `App.tsx` / `BottomTabs` |
| Risque | Confusion développeur, duplication conceptuelle |
| Action recommandée | Supprimer après checklist `MESSAGING_QA.md` |

Fichiers concernés : `ChatRoomScreen`, `ConversationsScreen`, `MessagesNavigator`, composants `ChatBubble`, `MessageComposer`, etc.

### 4.2 Composants dupliqués / orphelins

| Chemin | Problème |
|--------|----------|
| `src/components/messaging/*` | 10+ fichiers ; **aucun import** dans l’app active |
| `src/navigation/AfrozaTabBar.tsx` | **Jamais importé** (remplacé par `MagicBottomTab`) |
| `src/components/SearchBar.tsx` | Doublon avec `modules/messaging/components/SearchBar.tsx` |
| `src/components/PostCard.tsx` vs `components/feed/PostCard.tsx` | Deux implémentations feed |
| `src/screens/HomeScreen.tsx`, `SearchScreen.tsx`, `CreateScreen.tsx` | Non référencés dans `BottomTabs` |

### 4.3 Stores

| Store | Usage |
|-------|--------|
| `useMessagingStore` | Source de vérité messagerie |
| `messagesStore.ts` | **Alias** `useMessagesStore` → pas de duplication données |
| `feedStore`, `callsStore`, `authStore` | Actifs |

### 4.4 Dépendances

| Package | Verdict |
|---------|---------|
| `@types/react-native` | **Supprimé** ✅ |
| `@apollo/client`, `graphql`, `phoenix` | Présents ; usage partiel (auth/API) |
| `rn-emoji-keyboard` | Installé ; messagerie utilise panneau custom `InputBar` |
| `react-native-pager-view` | Vérifier usage (Onboarding ?) |

### 4.5 Fichiers utilitaires obsolètes

- `metro-polyfill.js` — contournement Node 18 ; **inutile avec Node 20**
- Scripts `fix-afroza-mobile.sh`, multiples `DIAGNOSTIC*.md` — doc historique SDK 54

---

## 5. Module messagerie (`src/modules/messaging`)

### Structure

```
messaging/
├── navigation/MessagingNavigator.tsx   (17 routes)
├── screens/          (18 écrans)
├── components/       (14 composants)
├── store/useMessagingStore.ts
├── hooks/            (selectors, voice recorder)
├── services/         (mockData, media, formatters, realtime stub)
└── theme.ts          (palette light/dark)
```

### Points forts

- Selectors dédiés (`useMessagingSelectors`) limitent les re-renders
- `ConversationItem` + `MessageBubble` : `React.memo`
- Chat : `FlatList` **inverted** (pattern WhatsApp)
- Clavier : correction Android (`resize` + pas de `behavior: 'height'`)

### Points d’attention

| Zone | Observation |
|------|-------------|
| `Avatar.tsx` | Souscrit à tout `contacts` du store — re-render si contacts changent |
| Animations liste | `FadeInDown.delay(index * 18)` sur chaque row — coût si > 50 items |
| GIFs / stickers | URLs externes Tenor — dépendance réseau |
| `realtime.ts` | Stub — pas de Phoenix branché dans le module actif |
| Couleurs | `#25D366` (online), `#EF4444` (recording) — hors tokens ; acceptable pour sémantique |

---

## 6. Autres modules

### Feed (`FeedScreen`)

- FlatList + `InteractivePostCard` mémorisé
- Sync like/save corrigée
- Navigation `Comments` déclarée mais route **non enregistrée** dans `App.tsx` — action commentaire = no-op navigation

### Communities / Calls / Profile

- FlatList standard
- Styles partiellement hors thème (à harmoniser en phase 2)

---

## 7. Problèmes de performance (synthèse)

Voir `PERFORMANCE_REVIEW.md` pour le détail.

| Priorité | Item |
|----------|------|
| P1 | Mémoïser `renderItem` chat (`ChatScreen`) |
| P2 | Réduire animations d’entrée sur longues listes |
| P3 | FlashList sur Feed + Conversations si profiling < 55 FPS |
| P4 | Sélecteur Zustand fin sur `Avatar` (contacts par id) |

---

## 8. Accessibilité & UX

| Critère | État |
|---------|------|
| Touch target 44px | Tokens `theme.accessibility` ; `PremiumButton` OK |
| Tab bar | `accessibilityRole="tab"` sur `MagicBottomTab` |
| Contraste textMuted | OK sur fond clair post-mise à jour tokens |
| Labels icônes header | Partiels — à compléter |

---

## 9. Recommandations par priorité

### P0 — Fait

- [x] Expo Doctor 18/18
- [x] Metro config officiel
- [x] Suppression `@types/react-native`
- [x] Patch expo / expo-font

### P1 — Court terme (1–2 sprints)

1. Supprimer `src/features/messaging` et `src/components/messaging` après QA
2. Supprimer `AfrozaTabBar.tsx`, écrans orphelins ou les brancher
3. Enregistrer route `Comments` ou retirer navigation morte du Feed
4. CI : Node 20 + `expo-doctor` + `tsc`

### P2 — Moyen terme

1. Deep links `afroza://chat/:conversationId`
2. Brancher `realtime.ts` (Phoenix) sur `useMessagingStore`
3. FlashList si métriques le justifient
4. Tests E2E Detox sur parcours messagerie

### P3 — Long terme

1. Unifier SearchBar / PostCard dupliqués
2. Mode sombre global (hors messagerie)
3. Audit `npm audit` (15 vulnérabilités modérées)

---

## 10. Fichiers de référence

| Document | Contenu |
|----------|---------|
| `CHANGELOG_STABILIZATION.md` | Liste des corrections |
| `MESSAGING_QA.md` | Checklist QA messagerie |
| `PERFORMANCE_REVIEW.md` | Analyse perf détaillée |
| `STABILIZATION_AUDIT.md` | Audit initial phase 1 |
| `/INFINITE_LOOP_ANALYSIS.md` | Boucles / effets (racine repo) |
