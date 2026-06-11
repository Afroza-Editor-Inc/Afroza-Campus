# 🔥 GUIDE COMPLET DE CORRECTION - BOUCLES INFINIES REACT NATIVE

## ✅ ERREURS CORRIGÉES

### 1️⃣ **TypingIndicator.tsx** ✓
**Problème** : Animation loop sans cleanup + dépendances instables
```javascript
// ❌ AVANT
React.useEffect(() => {
  const createAnimation = (dot: Animated.Value, delay: number) => {
    Animated.loop(...).start(); // JAMAIS stoppée
  };
}, [dot1, dot2, dot3]); // 🔴 Recréé à chaque render
```

**Solution** : Cleanup + [] dependencies
```javascript
// ✅ APRÈS
React.useEffect(() => {
  const animations: { stop: () => void }[] = [];
  const createAnimation = (dot: Animated.Value, delay: number) => {
    const anim = Animated.loop(...);
    anim.start();
    animations.push(anim);
  };
  createAnimation(dot1, 0);
  createAnimation(dot2, 200);
  createAnimation(dot3, 400);
  
  // ✅ CLEANUP : arrêter toutes les animations
  return () => {
    animations.forEach((anim) => anim.stop());
  };
}, []); // ✅ Vide = exécuté une seule fois
```

---

### 2️⃣ **ChatRoomScreen.tsx** ✓
**Problème** : `requestAnimationFrame()` sans cleanup = accumulation infinie
```javascript
// ❌ AVANT
React.useEffect(() => {
  requestAnimationFrame(() => {
    listRef.current?.scrollToEnd({ animated: false });
  }); 
}, [messages.length]); // 🔴 Chaque nouveau message = nouvelle frame en queue
```

**Solution** : Cleanup avec `cancelAnimationFrame()`
```javascript
// ✅ APRÈS
React.useEffect(() => {
  let frameId: number | null = null;
  
  if (messages.length > 0) {
    frameId = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }
  
  return () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId); // ✅ CLEANUP
    }
  };
}, [messages.length]);
```

---

### 3️⃣ **MagicBottomTab.tsx** ✓
**Problème** : SharedValues en dépendances = re-exécution de l'effet en continu
```javascript
// ❌ AVANT
React.useEffect(() => {
  bubbleIndex.value = withSpring(state.index, SPRING_CONFIG);
  bubbleScale.value = withSequence(...);
}, [bubbleIndex, bubbleScale, state.index]); // 🔴 SharedValues causent boucle

const handleLayout = React.useCallback(
  (event) => { barWidth.value = width; },
  [barWidth, bubbleIndex, state.index] // 🔴 Même problème
);
```

**Solution** : Retirer les SharedValues (références stables avec reanimated)
```javascript
// ✅ APRÈS
React.useEffect(() => {
  bubbleIndex.value = withSpring(state.index, SPRING_CONFIG);
  bubbleScale.value = withSequence(...);
}, [state.index]); // ✅ SEULEMENT les dépendances primitives

const handleLayout = React.useCallback(
  (event) => { barWidth.value = width; },
  [state.index] // ✅ Retirer barWidth, bubbleIndex
);
```

**Pourquoi** : Les SharedValues sont des références créées UNE FOIS avec `useSharedValue()`.  
Les mutating n'affectent pas le re-render comme les variables React normales.

---

### 4️⃣ **FeedScreen.tsx** ✓
**Problème** : Dépendances manquantes + handlers recréés à chaque render
```javascript
// ❌ AVANT
useEffect(() => {
  loadFeed();
}, []); // loadFeed n'est pas en deps

const loadFeed = async () => { // Défini APRÈS le useEffect!
  setLoading(true);
};

const handlePostLike = (postId: string) => {
  toggleLike(postId);
}; // Recréé à chaque render → InteractivePostCard re-rend
```

**Solution** : `useCallback` + dépendances correctes
```javascript
// ✅ APRÈS
const loadFeed = React.useCallback(async () => {
  setLoading(true);
  setTimeout(() => { setLoading(false); }, 500);
}, [setLoading]);

useEffect(() => {
  loadFeed();
}, [loadFeed]); // ✅ Inclure loadFeed en deps

// ✅ useCallback pour stabiliser les handlers
const handlePostLike = React.useCallback((postId: string) => {
  toggleLike(postId);
}, [toggleLike]);

const handlePostSave = React.useCallback((postId: string) => {
  toggleSave(postId);
}, [toggleSave]);

// ✅ useCallback pour handlers et renderers
const renderPost = React.useCallback(
  ({ item, index }) => (
    <View>
      <InteractivePostCard
        post={item}
        onLike={() => handlePostLike(item.id)}
        onComment={() => handlePostComment(item.id)}
        onShare={() => handlePostShare(item.id)}
        onSave={() => handlePostSave(item.id)}
      />
    </View>
  ),
  [posts.length, handlePostLike, handlePostComment, handlePostShare, handlePostSave]
);

// ✅ Utiliser la fonction, pas l'appel
<FlatList
  ListHeaderComponent={renderHeader}
  renderItem={renderPost}
/>
```

---

## 🛠️ BONNES PRATIQUES ESSENTIELLES

### Pattern 1️⃣ : useEffect avec cleanup
```typescript
// ✅ BON - Cleanup tout ce qui s'accumule
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  const frameId = requestAnimationFrame(() => {});
  const subscription = EventEmitter.subscribe(...);
  
  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(frameId);
    subscription.unsubscribe();
  };
}, [dependencies]);

// ❌ MAUVAIS - Pas de cleanup
useEffect(() => {
  setInterval(() => {}, 1000); // Fuite mémoire
}, []);
```

### Pattern 2️⃣ : Dépendances stables
```typescript
// ❌ MAUVAIS - Objet recréé à chaque render
const handlers = { onPress: () => {} };
useEffect(() => {
  // Cet effet se ré-exécute à chaque render!
}, [handlers]);

// ✅ BON - useMemo pour les objets/arrays
const handlers = useMemo(
  () => ({ onPress: () => {} }),
  []
);
useEffect(() => { }, [handlers]);

// ✅ BON - useCallback pour les fonctions
const onPress = useCallback(() => {}, [dependencies]);
```

### Pattern 3️⃣ : Shared Values avec react-native-reanimated
```typescript
// ❌ MAUVAIS - SharedValues en dépendances
const animValue = useSharedValue(0);
useEffect(() => {
  animValue.value = 1;
}, [animValue]); // 🔴 Boucle

// ✅ BON - Pas besoin en dépendances
useEffect(() => {
  animValue.value = 1; // Mutation directe
}, []); // ✅ Les SharedValues sont des références stables
```

### Pattern 4️⃣ : Selectors dans les stores Zustand
```typescript
// ❌ MAUVAIS - Retourne un nouvel array à chaque fois
const conversations = useMessagesStore(
  state => state.conversations.filter(...) // Nouvel array!
);

// ✅ BON - useShallow pour comparaison shallow
const conversations = useMessagesStore(
  useShallow(state => state.conversations)
);

// ✅ BON - Inclure la logique dans le store
const getFilteredConversations = useMessagesStore(
  state => state.getFilteredConversations(filter)
);
```

---

## 📋 CHECKLIST ANTI-BUG

Avant de déployer du code, vérifier :

- [ ] **Tous les `useEffect` ont des dependencies array** :
  ```typescript
  // ❌ Never
  useEffect(() => { ... });
  ```

- [ ] **Les dependencies incluent toutes les dépendances externes** :
  ```typescript
  // ✅ Inclure toutes les vars capturées
  useEffect(() => {
    handler(); // handler doit être en deps
  }, [handler]);
  ```

- [ ] **Les animations ont `return () => { stop() }`** :
  ```typescript
  // ✅ Cleanup les animations Animated et Reanimated
  useEffect(() => {
    anim.start();
    return () => anim.stop(); // Pour Animated.loop
  }, []);
  ```

- [ ] **Les timers sont nettoyés** :
  ```typescript
  useEffect(() => {
    const id = setTimeout(() => {}, 1000);
    return () => clearTimeout(id);
  }, []);
  ```

- [ ] **Les requestAnimationFrame sont nettoyés** :
  ```typescript
  useEffect(() => {
    const id = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(id);
  }, []);
  ```

- [ ] **Les handlers sont mémorisés avec `useCallback`** :
  ```typescript
  // ✅ Si le handler est passé aux enfants
  const onPress = useCallback(() => {}, [deps]);
  ```

- [ ] **Les objets/arrays sont stables** :
  ```typescript
  // ✅ Utiliser useMemo
  const obj = useMemo(() => ({ test: true }), [deps]);
  ```

- [ ] **Les SharedValues ne sont pas en dépendances**:
  ```typescript
  // ✅ Pas en deps: bubbleIndex, barWidth, etc.
  useEffect(() => {
    sharedValue.value = 10;
  }, []); // ✅
  ```

- [ ] **Pas de `setState` dans le render** :
  ```typescript
  // ❌ JAMAIS
  function MyComponent() {
    const [state, setState] = useState(0);
    setState(state + 1); // 🔴 Boucle infinie
    return <View />;
  }
  ```

- [ ] **Pas de store selectors qui retournent de nouveaux arrays** :
  ```typescript
  // ✅ Utiliser useShallow ou une fonction du store
  const items = useStore(useShallow(state => state.items));
  ```

---

## 🔍 DEBUG CHECKLIST

Si vous voyez encore "Maximum update depth exceeded":

1. **Vérifier React DevTools Profiler** :
   - Chercher quel composant re-rend en boucle
   - Vérifier les props qui changent

2. **Chercher les patterns courants** :
   ```bash
   grep -n "useEffect(() =>" src/  # Vérifier tous les effects
   grep -n "useSharedValue" src/   # Vérifier qu'ils ne sont pas en deps
   grep -n "setState" src/         # Vérifier pas dans render
   ```

3. **Ajouter des logs** :
   ```typescript
   useEffect(() => {
     console.log('Effect running', new Error().stack);
   }, [deps]);
   ```

4. **Isoler le composant** :
   - Commenter des sections pour identifier la source
   - Tester avec des données mock simples

---

## 📦 FICHIERS CORRIGÉS

✅ `src/components/messaging/TypingIndicator.tsx`  
✅ `src/features/messaging/screens/ChatRoomScreen.tsx`  
✅ `src/navigation/MagicBottomTab.tsx`  
✅ `src/screens/FeedScreen.tsx`  

---

## 🚀 PROCHAINES ÉTAPES

### A Corriger (Priority)

1. **messagesStore.ts** - Cleanup les deliveryTimers
2. **InteractivePostCard.tsx** - Vérifier que state ne se ré-initialise pas
3. **SearchScreen.tsx** - Vérifier les inline arrays
4. **ConversationsScreen.tsx** - Vérifier les store selectors

### Best Practices à Appliquer Globalement

- [ ] Implémenter un custom hook `useAsync()` pour les appels API
- [ ] Créer un wrapper `useAnimatedValue()` qui gère le cleanup
- [ ] Auditer tous les `useEffect` du projet
- [ ] Ajouter ESLint rule : `react-hooks/exhaustive-deps`

---

## 💡 RESSOURCES

- [React Hooks Docs - useEffect cleanup](https://react.dev/reference/react/useEffect#cleaning-up-an-effect)
- [React Native Reanimated - Shared Values](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/shared-values/)
- [Zustand - Selectors](https://github.com/pmndrs/zustand#selecting-multiple-stores)
