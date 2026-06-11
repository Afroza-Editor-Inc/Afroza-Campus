# PERFORMANCE_REVIEW — Afroza Campus Mobile

**Date :** 5 juin 2026  
**Scope :** `frontend/mobile/src`  
**Objectif :** Fluidité sur appareils Android modestes sans changer le comportement fonctionnel.

---

## 1. Méthodologie

Analyse statique du code :

- Usage `FlatList` / `FlashList`
- `React.memo`, `useMemo`, `useCallback`
- Effets `useEffect` et animations Reanimated / Animated
- Sélecteurs Zustand

**Non réalisé dans ce rapport :** profiling Flipper / React DevTools sur device réel (recommandé en QA).

---

## 2. Inventaire listes virtuelles

| Écran | Composant | Optimisations présentes |
|-------|-----------|-------------------------|
| Conversations | FlatList | `initialNumToRender: 12`, `windowSize: 7`, `removeClippedSubviews`, `renderItem` mémorisé ✅ |
| Chat | FlatList inverted | `initialNumToRender: 10`, `windowSize: 5`, `renderItem` mémorisé ✅ |
| NewChat | FlatList | Basique |
| ConversationSearch | FlatList | Basique |
| ConversationMedia | FlatList | Basique |
| StarredMessages | FlatList | Basique |
| Feed | FlatList | `renderPost` + handlers mémorisés ✅ |
| Communities | FlatList ×3 | Non optimisé |
| Calls | FlatList ×2 | Non optimisé |
| Onboarding | FlatList | Horizontal paging |

**FlashList :** non installé — acceptable pour MVP ; envisager si listes > 200 items visibles.

---

## 3. Mémoïsation composants

| Composant | `React.memo` | Verdict |
|-----------|--------------|---------|
| `ConversationItem` | ✅ | Bon |
| `MessageBubble` | ✅ | Bon |
| `InteractivePostCard` | ❌ | Re-render parent Feed acceptable |
| `FilterTabs` | ❌ | Faible coût |
| `Avatar` (messaging) | ❌ | Re-render si `contacts` change |

### Recommandation Avatar

Remplacer l’accès global `state.contacts` par un sélecteur :

```typescript
// Cible : ne re-render que si le contact affiché change
const contact = useMessagingStore((s) => s.contacts.find((c) => c.id === contactId));
```

---

## 4. Hooks & re-renders

### 4.1 Patterns sains (déjà en place)

- `useMessagingSelectors` : conversations filtrées, messages par id
- `ChatScreen` : `buildListData` dans `useMemo([messages])`
- `InputBar` : `emojiLookup`, filtres GIF/stickers mémorisés
- `MagicBottomTab` : deps Reanimated corrigées (pas de boucle tab bar)
- `messagesStore` : alias unique vers `useMessagingStore`

### 4.2 Points de vigilance

| Fichier | Pattern | Impact |
|---------|---------|--------|
| `ConversationItem` | `FadeInDown.delay(index * 18)` | O(n) animations à l’affichage |
| `MessageBubble` | `FadeInUp.delay(index * 18)` | Idem dans le chat |
| `FeedScreen` | `ListHeaderComponent` recréé si `searchQuery` change | Normal |
| `MagicBottomTab` | `reduce` unread sur chaque render store | Faible ; pourrait être dérivé dans le store |

---

## 5. Chat — performance spécifique

### 5.1 Liste inversée

`inverted` sur `FlatList` évite `scrollToEnd` agressif — **bon pattern** pour messagerie.

Pas de `useEffect` sur `messages.length` + `scrollToEnd` dans le module actif (contrairement au legacy `ChatRoomScreen`).

### 5.2 Corrections appliquées cette phase

- `renderMessage` + `handleMessageLongPress` en `useCallback` → stabilité références `MessageBubble` mémoïsé

### 5.3 Pistes sans changement UX

1. Désactiver `entering` Reanimated sur messages au-delà de l’index 15
2. `getItemLayout` si hauteurs bulles fixes (complexe avec pièces jointes)
3. `maintainVisibleContentPosition` (RN récent) pour stabilité scroll lors réception

---

## 6. Feed — performance

| Aspect | État |
|--------|------|
| `renderPost` mémorisé | ✅ |
| Handlers like/save/comment | ✅ `useCallback` |
| `InteractivePostCard` state local | Sync props via `useEffect` ✅ |
| Stories + header dans `ListHeaderComponent` | Re-render search OK |

**Risque :** navigation `Comments` non enregistrée — pas d’impact perf.

---

## 7. Images & médias

- GIFs : chargement réseau `Image` / preview — pas de cache explicite
- `expo-av` pour audio/vidéo dans bulles — libérer lecteur au unmount (vérifier en QA longue session)
- `expo-image-picker` : permissions à la demande — OK

**Recommandation :** `expo-image` avec cache disque pour avatars et médias conversation (phase 2).

---

## 8. Navigation

- `lazy: true` + `freezeOnBlur: true` sur tabs ✅
- Stack messagerie : pas de nested heavy screens en parallèle

---

## 9. Bundle & dépendances perf

| Package | Poids perf |
|---------|------------|
| `react-native-reanimated` | Nécessaire — bien configuré (worklets plugin) |
| `rn-emoji-keyboard` | Installé mais panneau custom — candidat suppression si inutilisé |
| `@apollo/client` | OK si utilisé au login uniquement |

---

## 10. Matrice priorisation

| ID | Action | Effort | Impact | Statut |
|----|--------|--------|--------|--------|
| P1 | `renderMessage` mémorisé (Chat) | S | Moyen | ✅ Fait |
| P1 | `renderConversation` mémorisé (liste) | S | Moyen | ✅ Fait |
| P2 | Limiter animations entrée index > 15 | M | Moyen | ☐ |
| P2 | Sélecteur fin `Avatar` | S | Moyen | ☐ |
| P3 | FlashList Conversations + Feed | M | Élevé si longues listes | ☐ |
| P3 | `expo-image` cache | M | Moyen | ☐ |
| P4 | Supprimer `rn-emoji-keyboard` si inutile | S | Faible bundle | ☐ |

---

## 11. Budget performance cible

| Métrique | Cible |
|----------|-------|
| FPS scroll conversations | ≥ 55 |
| FPS scroll chat (100 msg) | ≥ 55 |
| TTI ouverture chat | < 400 ms |
| RAM après 30 min chat | Stable (pas de fuite audio) |

**Validation :** React Native Performance Monitor ou `why-did-you-render` en dev uniquement.

---

## 12. Conclusion

Le module messagerie est **déjà raisonnablement optimisé** pour une beta (FlatList tuning + memo sur rows/bulles). Les gains suivants sont incrémentaux : réduire les animations d’entrée en masse, FlashList si profiling device réel le justifie, et affiner les sélecteurs Zustand sur `Avatar`.

Aucune modification comportementale requise pour atteindre la stabilité actuelle — les correctifs perf appliqués renforcent la stabilité des références de rendu.
