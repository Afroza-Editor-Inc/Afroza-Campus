# 🔧 CORRECTIONS ADDITIONNELLES - STORES & COMPOSANTS

## 1️⃣ **messagesStore.ts** - Cleanup des timers

### Problème Identifié
Les `deliveryTimers` s'accumulent en mémoire sans jamais être supprimés :
```typescript
const timers = [
  setTimeout(() => { ... }, 250),
  setTimeout(() => { ... }, 800),
  setTimeout(() => { ... }, 1600),
];

deliveryTimers.set(outgoingMessage.id, timers); // ✅ Ajouté
// ❌ Jamais supprimé de la Map!
```

### Solution Complète

Ajouter une fonction helper pour wrapper les timers avec auto-cleanup :

```typescript
// === HELPER FUNCTION À AJOUTER ===
function createAutoCleanupTimers(
  timeouts: { delay: number; callback: () => void }[],
  timerRef: Map<string, ReturnType<typeof setTimeout>[]>,
  messageId: string
): ReturnType<typeof setTimeout>[] {
  const timers = timeouts.map(({ delay, callback }) =>
    setTimeout(() => {
      callback();
      // ✅ Cleanup automatique après l'exécution
      timerRef.delete(messageId);
    }, delay)
  );

  timerRef.set(messageId, timers);
  return timers;
}

// === UTILISER DANS sendMessage ===
const timers = createAutoCleanupTimers(
  [
    {
      delay: 250,
      callback: () => {
        set((state) => ({
          messagesByConversation: patchMessageStatus(
            state.messagesByConversation,
            conversationId,
            outgoingMessage.id,
            'sent'
          ),
        }));
      },
    },
    {
      delay: 800,
      callback: () => {
        set((state) => ({
          messagesByConversation: patchMessageStatus(
            state.messagesByConversation,
            conversationId,
            outgoingMessage.id,
            'delivered'
          ),
        }));
      },
    },
    {
      delay: 1600,
      callback: () => {
        set((state) => ({
          messagesByConversation: patchMessageStatus(
            state.messagesByConversation,
            conversationId,
            outgoingMessage.id,
            'read'
          ),
        }));
      },
    },
  ],
  deliveryTimers,
  outgoingMessage.id
);
```

### Alternative Plus Propre

Créer un fichier `src/store/helpers/timerManager.ts` :

```typescript
// timerManager.ts
export class TimerManager {
  private timers = new Map<string, ReturnType<typeof setTimeout>[]>();
  private replyTimers = new Map<string, ReturnType<typeof setTimeout>>();

  addDeliveryTimers(
    messageId: string,
    onSent: () => void,
    onDelivered: () => void,
    onRead: () => void
  ) {
    const timers = [
      this.createTimer(250, () => {
        onSent();
        this.cleanupDeliveryTimer(messageId); // ✅ Auto-cleanup
      }),
      this.createTimer(800, () => {
        onDelivered();
      }),
      this.createTimer(1600, () => {
        onRead();
      }),
    ];

    this.timers.set(messageId, timers);
  }

  addReplyTimer(
    conversationId: string,
    onReply: () => void,
    delay: number = 1750
  ) {
    if (this.replyTimers.has(conversationId)) {
      clearTimeout(this.replyTimers.get(conversationId)!);
    }

    const timer = this.createTimer(delay, () => {
      onReply();
      this.replyTimers.delete(conversationId);
    });

    this.replyTimers.set(conversationId, timer);
  }

  private createTimer(
    delay: number,
    callback: () => void
  ): ReturnType<typeof setTimeout> {
    return setTimeout(callback, delay);
  }

  cleanupDeliveryTimer(messageId: string) {
    const timers = this.timers.get(messageId);
    if (timers) {
      timers.forEach(clearTimeout);
      this.timers.delete(messageId);
    }
  }

  cleanupAll() {
    this.timers.forEach((timers) => timers.forEach(clearTimeout));
    this.replyTimers.forEach(clearTimeout);
    this.timers.clear();
    this.replyTimers.clear();
  }
}

// L'utiliser dans le store
const timerManager = new TimerManager();

export const useMessagesStore = create<MessagesState>((set, get) => ({
  sendMessage: ({ conversationId, text, attachments }) => {
    // ...
    timerManager.addDeliveryTimers(
      outgoingMessage.id,
      () => { /* onSent */ },
      () => { /* onDelivered */ },
      () => { /* onRead */ }
    );
  },
}));
```

---

## 2️⃣ **InteractivePostCard.tsx** - Éviter re-initialisation du state

### Problème
Si le component initialise son state avec un prop, il ne sync pas quand le prop change.

```typescript
// ❌ MAUVAIS
function InteractivePostCard({ post }) {
  const [likes, setLikes] = useState(post.likes); // ❌ JAMAIS mis à jour!
  // ...
}
```

### Solution
Utiliser `useEffect` ou déterminer l'état du parent :

```typescript
// ✅ BON 1 - Utiliser useEffect pour synchroniser
function InteractivePostCard({ post }) {
  const [likes, setLikes] = useState(post.likes);

  useEffect(() => {
    setLikes(post.likes); // Sync quand post change
  }, [post.likes]);

  return <Text>{likes}</Text>;
}

// ✅ BON 2 - Ou simplement utiliser le prop (pas besoin de state)
function InteractivePostCard({ post }) {
  return <Text>{post.likes}</Text>;
}

// ✅ BON 3 - Si je dois modifier localement
function InteractivePostCard({ post, onLike }) {
  const [localLikes, setLocalLikes] = useState(0);

  const handleLike = useCallback(() => {
    setLocalLikes((prev) => prev + 1);
    onLike(post.id); // Notifier le parent
  }, [post.id, onLike]);

  return <Button onPress={handleLike}>{post.likes + localLikes}</Button>;
}
```

---

## 3️⃣ **SearchScreen.tsx** - Éviter arrays inline

### Problème
Créer des arrays à chaque render → passe de nouveaux props aux enfants → re-render

```typescript
// ❌ MAUVAIS
function SearchScreen() {
  return (
    <FlatList
      data={results.filter((r) => r.type === 'user')} // ✅ Nouvel array à chaque render!
      renderItem={renderUser}
    />
  );
}
```

### Solution
Utiliser `useMemo` ou inclure la logique dans le store :

```typescript
// ✅ BON 1 - useMemo
function SearchScreen() {
  const [query, setQuery] = useState('');
  
  const filteredResults = useMemo(
    () => results.filter((r) => r.type === 'user'),
    [results]
  );

  return (
    <FlatList
      data={filteredResults}
      renderItem={renderUser}
    />
  );
}

// ✅ BON 2 - Ou dans le store
const SearchStore = create((set, get) => ({
  getFilteredResults: (type) => 
    get().results.filter((r) => r.type === type),
}));

function SearchScreen() {
  const filteredResults = useSearchStore(
    useShallow((store) => store.getFilteredResults('user'))
  );

  return <FlatList data={filteredResults} />;
}
```

---

## 4️⃣ **ConversationsScreen.tsx** - Corriger les selectors Zustand

### Problème
Store selector retourne un nouvel array à chaque fois :

```typescript
// ❌ MAUVAIS
const conversations = useMessagesStore(
  (state) => state.conversations.filter((c) => !c.isMuted)
);
// Chaque render = nouvel array filtré = FlatList re-rend entièrement
```

### Solution

```typescript
// ✅ BON 1 - useShallow pour comparaison
const conversations = useMessagesStore(
  useShallow((state) => state.conversations)
);

// ✅ BON 2 - Ou implémenter dans le store
const useMessagesStore = create((set, get) => ({
  getUnmutedConversations: () =>
    get().conversations.filter((c) => !c.isMuted),
}));

const conversations = useMessagesStore(
  (state) => state.getUnmutedConversations()
);

// ✅ BON 3 - Memoïze le resultat avec useMemo
const conversations = useMemo(
  () => allConversations.filter((c) => !c.isMuted),
  [allConversations]
);
```

---

## 5️⃣ **SplashScreen.tsx** - Animated values en dépendances

### Problème
Animated.Value en dependencies cause re-trigger de l'effet

```typescript
// ❌ MAUVAIS
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  }).start();
}, [fadeAnim]); // 🔴 Cause animations à redémarrer en boucle
```

### Solution
Utiliser le ref, pas les dépendances :

```typescript
// ✅ BON
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  }).start();
}, []); // ✅ Vide = exécuté une fois
```

---

## 6️⃣ **BottomTabs.tsx** - Inline screenOptions

### Problème
`screenOptions` recréé à chaque render :

```typescript
// ❌ MAUVAIS
<Tab.Navigator
  screenOptions={({ route }) => ({  // ✅ Recréé chaque render
    header: () => <CustomHeader />,
    tabBarIcon: () => <Icon />,
    // ...
  })}
>
```

### Solution
Utiliser `useMemo` ou `useCallback` :

```typescript
// ✅ BON 1 - useMemo
const screenOptions = useMemo(
  () => ({
    tabBarStyle: styles.tabBar,
    headerStyle: styles.header,
  }),
  []
);

<Tab.Navigator screenOptions={screenOptions}>

// ✅ BON 2 - useCallback si paramétré
const getScreenOptions = useCallback(
  ({ route }) => ({
    tabBarLabel: LABELS[route.name],
    tabBarIcon: ({ focused }) => getIcon(route.name, focused),
  }),
  []
);

<Tab.Navigator screenOptions={getScreenOptions}>
```

---

## 📋 QUICK FIXES - EXÉCUTE MAINTENANT

```bash
# 1. SearchScreen - Vérifier arrays inline
grep -n "\.filter\|\.map" src/screens/SearchScreen.tsx

# 2. ConversationsScreen - Vérifier selectors
grep -n "useMessagesStore" src/screens/ConversationsScreen.tsx

# 3. SplashScreen - Vérifier animations en deps
grep -n "useEffect" src/screens/SplashScreen.tsx

# 4. BottomTabs - Vérifier screenOptions inline
grep -n "screenOptions" src/navigation/BottomTabs.tsx
```

---

## ✅ VALIDATION FINALE

Avant de déployer, vérifier :

1. **Aucun `useEffect` sans dependency array** :
   ```bash
   grep -n "useEffect(() =>" src/**/*.tsx | grep -v "useEffect(() => {" 
   ```

2. **Aucun timer/animation sans cleanup** :
   ```bash
   grep -rn "setTimeout\|setInterval\|requestAnimationFrame" src/ | grep -v "clearTimeout\|clearInterval\|cancelAnimationFrame"
   ```

3. **Aucun array inline dans data props** :
   ```bash
   grep -n "data={.*\.filter\|data={.*\.map" src/**/*.tsx
   ```

4. **Test en React DevTools Profiler** :
   - Chercher "jumped" ou "re-rendered" en orange
   - Vérifier qu'aucun component ne re-rend en boucle
