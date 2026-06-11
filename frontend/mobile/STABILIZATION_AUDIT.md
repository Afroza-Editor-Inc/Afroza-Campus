# Afroza Campus Mobile — Audit de stabilisation

**Date :** 5 juin 2026  
**Périmètre :** `afroza-campus/frontend/mobile`  
**Stack :** Expo SDK 54 · React Native 0.81 · React 19 · React Navigation 6 · Reanimated 4 · Zustand

---

## Synthèse exécutive

| Domaine | État | Priorité suivante |
|--------|------|-------------------|
| Compilation TypeScript | ✅ `tsc --noEmit` OK | Maintenir en CI |
| Expo / Metro | ⚠️ Node 20 requis (script `ensure-node.js`) | Utiliser `nvm use 20` avant `npm run doctor` |
| Expo Router | N/A | Navigation classique (`App.tsx` + stacks) |
| Design system | ✅ Tokens alignés spec (#0072FF, #00FF6A, neutres) | Étendre aux écrans Auth / Onboarding |
| Messagerie active | ✅ `src/modules/messaging` | Ne pas réactiver `src/features/messaging` (legacy) |
| Boucles / effets critiques | ✅ Corrigés (voir `INFINITE_LOOP_ANALYSIS.md`) | Surveiller nouveaux `useEffect` |
| Performance listes | 🟡 FlatList optimisée (conv.) ; Feed OK | FlashList optionnel plus tard |
| Accessibilité | 🟡 `accessibility` tokens + boutons | Audit contraste écran par écran |

---

## Architecture

```
App.tsx (Stack root)
├── Splash → Onboarding → Auth
├── MainTabs (BottomTabs + MagicBottomTab)
│   ├── Messages → MessagingNavigator (module principal)
│   ├── Feed / Communities / Calls / Profile
├── ChatRoom (wrapper → ChatScreen du module messaging)
└── Modals: PostCreate, Settings, Notifications
```

**Points forts**

- Séparation claire onglets / stack messagerie (`MessagingNavigator`).
- Thème global `src/theme/index.ts` + palette messagerie `modules/messaging/theme.ts`.
- Stores Zustand (`messagesStore`, `useMessagingStore`, `feedStore`, `callsStore`).

**Dette technique (à traiter progressivement)**

| Élément | Risque | Recommandation |
|---------|--------|----------------|
| `src/features/messaging/*` | Confusion, code mort | Supprimer ou archiver après validation QA |
| `messagesStore` vs `useMessagingStore` | Double source de vérité | Unifier à terme sur `useMessagingStore` |
| `ChatRoom` stack + onglet Messages | Deux chemins vers le chat | Garder wrapper ; documenter deep links |

---

## Stabilité technique

### Dépendances (package.json)

- **Expo** `~54.0.34` · **RN** `0.81.5` · **Reanimated** `~4.1.1` · **Gesture Handler** `~2.28.0`
- Babel : `react-native-worklets/plugin` (correct pour Reanimated 4)
- Pas de React Query dans le mobile actuel (spec mentionnée — non bloquant)

### Environnement

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd afroza-campus/frontend/mobile
npm run doctor
npm start
```

Metro échoue sur Node 18 (`Array.prototype.toReversed`).

### Corrections déjà en place (avant cette phase)

- `FeedScreen` : `loadFeed` stabilisé (`useCallback` + deps)
- `ChatRoomScreen` (legacy) : scroll + `cancelAnimationFrame`
- `MagicBottomTab` : deps Reanimated corrigées
- `TypingIndicator` : cleanup `Animated.loop`
- `SplashScreen` : deps limitées à `[navigation]`

### Modifications de cette phase

1. **Design system** — neutres spec (`#F7F9FC`, `#E8EDF5`, `#A7B1C2`, `#111827`), `gradients.bubbleMine`, `accessibility.minTouchTarget`
2. **Messagerie** — bulles & previews utilisent `messagingGradient` / `theme.colors` (plus de `#1A73E8` hardcodé)
3. **Feed** — titre via `typography.title3` ; `InteractivePostCard` sync like/save avec le store parent
4. **Listes** — `ConversationsScreen` : `renderItem` / séparateur mémorisés
5. **UX tactile** — `PremiumButton` : `minHeight` 44 + `hitSlop`

---

## Design system Afroza

| Token | Valeur |
|-------|--------|
| Primary | `#0072FF` |
| Secondary | `#00FF6A` |
| Accent | `#00A3FF` |
| Gradient brand | Blue → Accent → Green |
| Surface muted | `#F7F9FC` |
| Border / strong | `#E8EDF5` |
| Text | `#333333` |
| Text strong | `#111827` |
| Text muted | `#A7B1C2` |

**Spacing :** `xxs` 4 → `xxxl` 40  
**Radii :** `xs` 10 → `round` 999  
**Typo :** `hero`, `title1–3`, `body`, `bodyMuted`, `label`, `caption`

---

## Navigation & animations

- Stack : `slide_from_right` ; modals : `slide_from_bottom`
- Tab bar : `MagicBottomTab` (Reanimated spring, badges Messages/Calls)
- Options : `lazy`, `freezeOnBlur`, `tabBarHideOnKeyboard`
- Micro-interactions : haptics (`utils/haptics.ts`), press scale onglets

**À harmoniser (phase 2)**

- Transitions header chat ↔ profil (shared element léger ou fade cohérent)
- Deep linking Expo (`expo-linking`) non branché sur `MessagingNavigator`

---

## Module messagerie (ne pas reconstruire)

**Écrans actifs :** Conversations, Chat, NewChat, profils, paramètres, wallpapers, etc.

| Zone | Statut | Notes |
|------|--------|-------|
| Liste conversations | ✅ FlatList tuned | `initialNumToRender`, `windowSize`, `removeClippedSubviews` |
| Chat | ✅ `inverted` FlatList + `KeyboardAvoidingView` | Pas de scroll auto agressif (évite jitter) |
| Bulles | ✅ Gradient brand | Proportions conservées |
| Input / voix / pièces jointes | ✅ | Tester clavier Android réel |
| Nouvelle discussion | ✅ | Densité via `ConversationItem` |

---

## Performance (recommandations)

1. Mémoïser `MessageBubble` si profiling montre du coût sur longs threads
2. Envisager `@shopify/flash-list` uniquement sur Feed + Conversations si FPS < 55
3. Éviter `FadeInDown.delay(index * 18)` sur listes > 50 items (coût entrée)
4. Sélecteurs Zustand fins (`useMessagingSelectors`) — déjà en place

---

## Accessibilité

- Cible tactile minimale : **44pt** (`theme.accessibility`)
- Contraste : vérifier `textMuted` sur `surfaceMuted` (ratio ~4.5:1 sur la plupart des paires)
- Labels : tab bar et boutons header — compléter `accessibilityLabel` sur icônes seules

---

## Plan de travail recommandé (ordre)

1. **Environnement** — Node 20 + `expo-doctor` vert en CI
2. **Nettoyage** — retirer `features/messaging` après tests manuels
3. **Unification store** — un seul store messagerie
4. **Écrans secondaires** — Auth, Profile, Communities : remplacer couleurs ad hoc par `theme`
5. **FlashList** — si métriques perf le justifient
6. **Deep links** — schéma `afroza://chat/:id`

---

## Checklist validation manuelle

- [ ] Expo Go : Splash → Onboarding → Auth → Tabs
- [ ] Onglet Messages : scroll, FAB, ouverture chat, retour
- [ ] Chat : clavier iOS/Android, pièces jointes, vocal
- [ ] Feed : like/save synchronisés après refresh store
- [ ] Tab bar : badges, animation bulle, clavier masque la barre
- [ ] Aucune erreur rouge dans la console Metro

---

## Fichiers de référence

- Analyse boucles : `/INFINITE_LOOP_ANALYSIS.md` (racine repo)
- Thème : `src/theme/index.ts`
- Messagerie : `src/modules/messaging/`
- Navigation : `src/navigation/BottomTabs.tsx`, `App.tsx`
