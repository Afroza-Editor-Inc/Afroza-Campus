# 🛠️ HELPERS & SNIPPETS RÉUTILISABLES

Copier-coller ces helpers dans vos projets pour éviter les boucles infinies.

---

## 1. `useAsync` - Hook pour API calls

```typescript
// hooks/useAsync.ts
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  options?: UseAsyncOptions<T>
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const mountedRef = useRef(true);

  // ✅ Wrapper pour vérifier que le component est monté
  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      if (mountedRef.current) {
        setData(response);
        setStatus('success');
        options?.onSuccess?.(response);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as E);
        setStatus('error');
        options?.onError?.(err as E);
      }
    }
  }, [asyncFunction, options]);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      mountedRef.current = false; // ✅ Cleanup
    };
  }, [execute, immediate]);

  return { execute, status, data, error };
}

// ✅ USAGE
function MyComponent() {
  const { data, status } = useAsync(async () => {
    const res = await fetch('/api/data');
    return res.json();
  });

  if (status === 'pending') return <Loading />;
  if (status === 'error') return <Error />;
  return <View>{data}</View>;
}
```

---

## 2. `useAnimationCleanup` - Hook pour animations

```typescript
// hooks/useAnimationCleanup.ts
import { useEffect, useRef } from 'react';
import Animated, { 
  Easing,
  timing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export function useAnimationCleanup(
  animationConfig: { duration: number; toValue: number }
) {
  const animValue = useSharedValue(0);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    // ✅ Lancer l'animation
    animationRef.current = withTiming(animationConfig.toValue, {
      duration: animationConfig.duration,
      easing: Easing.inOut(Easing.ease),
    });

    // ✅ Cleanup automatique au démontage
    return () => {
      if (animationRef.current) {
        // Arrêter l'animation si nécessaire
        animValue.value = 0; // Reset
      }
    };
  }, [animationConfig.duration, animationConfig.toValue, animValue]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: animValue.value,
  }));

  return { animValue, animStyle };
}

// ✅ USAGE
function FadeInComponent() {
  const { animStyle } = useAnimationCleanup({
    duration: 500,
    toValue: 1,
  });

  return (
    <Animated.View style={animStyle}>
      <Text>Fade in!</Text>
    </Animated.View>
  );
}
```

---

## 3. `useDebounce` - Hook pour éviter les rendus excessifs

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // ✅ Set up le timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // ✅ Cleanup du timer si la valeur change ou si component démonte
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ✅ USAGE
function SearchScreen() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Cet effect s'exécute seulement 300ms après que l'utilisateur arrête de typer
    if (debouncedQuery) {
      search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder="Chercher..."
    />
  );
}
```

---

## 4. `useCallableState` - State + Callback

```typescript
// hooks/useCallableState.ts
import { useCallback, useState } from 'react';

export function useCallableState<T>(
  initialValue: T
): [T, (value: T, callback?: (newValue: T) => void) => void] {
  const [state, setState] = useState<T>(initialValue);

  const setStateWithCallback = useCallback(
    (value: T, callback?: (newValue: T) => void) => {
      setState((prevState) => {
        const newState = typeof value === 'function' ? (value as any)(prevState) : value;
        callback?.(newState);
        return newState;
      });
    },
    []
  );

  return [state, setStateWithCallback];
}

// ✅ USAGE - Quand vous avez besoin de savoir la nouvelle valeur du state immédiatement
function MyComponent() {
  const [count, setCount] = useCallableState(0);

  const increment = () => {
    setCount((prev) => prev + 1, (newCount) => {
      console.log('Count is now:', newCount); // ✅ Callback immédiat
    });
  };

  return <Button onPress={increment}>Count: {count}</Button>;
}
```

---

## 5. `useShallowCompare` - Éviter re-renders inutiles

```typescript
// hooks/useShallowCompare.ts
import { useEffect, useRef } from 'react';

function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => obj1[key] === obj2[key]);
}

export function useShallowCompare(value: any) {
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!shallowEqual(value, prevValueRef.current)) {
      prevValueRef.current = value;
    }
  }, [value]);

  return prevValueRef.current;
}

// ✅ USAGE
function MyComponent({ style }) {
  const stableStyle = useShallowCompare(style);

  return <View style={stableStyle}>Content</View>;
}
```

---

## 6. `useEffectOnce` - Exécuter SEULEMENT au montage

```typescript
// hooks/useEffectOnce.ts
import { useEffect } from 'react';

export function useEffectOnce(effect: () => void | (() => void)) {
  useEffect(() => {
    return effect();
  }, []); // ✅ Dépendances vides = une seule fois
}

// ✅ USAGE
function MyComponent() {
  useEffectOnce(() => {
    console.log('Component mounted!');
    
    return () => {
      console.log('Component unmounted!');
    };
  });

  return <View>Hello</View>;
}
```

---

## 7. `usePrevious` - Comparaison avec valeur précédente

```typescript
// hooks/usePrevious.ts
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T>();

  useEffect(() => {
    prevRef.current = value;
  }, [value]);

  return prevRef.current;
}

// ✅ USAGE
function MyComponent({ count }) {
  const prevCount = usePrevious(count);

  if (prevCount !== undefined && count > prevCount) {
    console.log('Count increased!');
  }

  return <Text>{count}</Text>;
}
```

---

## 8. Timer Manager - Classe pour gérer les timers

```typescript
// utils/TimerManager.ts
export class TimerManager {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private intervals = new Map<string, ReturnType<typeof setInterval>>();

  // ✅ Ajouter un timer avec auto-cleanup
  addTimer(id: string, callback: () => void, delay: number) {
    this.clearTimer(id); // Nettoyer l'ancien timer s'il existe

    const timer = setTimeout(() => {
      callback();
      this.clearTimer(id); // Auto-cleanup après exécution
    }, delay);

    this.timers.set(id, timer);
  }

  // ✅ Ajouter un interval avec cleanup
  addInterval(id: string, callback: () => void, delay: number) {
    this.clearInterval(id);

    const interval = setInterval(callback, delay);
    this.intervals.set(id, interval);
  }

  // ✅ Nettoyer un timer spécifique
  clearTimer(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  // ✅ Nettoyer un interval spécifique
  clearInterval(id: string) {
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
  }

  // ✅ Nettoyer TOUS les timers
  clearAll() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.intervals.forEach((interval) => clearInterval(interval));
    this.timers.clear();
    this.intervals.clear();
  }
}

// ✅ USAGE
const timerManager = new TimerManager();

export const useMessagesStore = create((set, get) => ({
  sendMessage: ({ conversationId, text }) => {
    // ...
    timerManager.addTimer(`send_${messageId}`, () => {
      set((state) => ({...}));
    }, 1000);
  },
}));
```

---

## 9. Component Wrapper avec ErrorBoundary

```typescript
// components/SafeComponent.tsx
import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SafeComponent extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text>Error: {this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// ✅ USAGE
<SafeComponent>
  <MyApp />
</SafeComponent>
```

---

## 10. Memo wrapper pour FlatList items

```typescript
// components/MemoizedListItem.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';

interface MemoizedListItemProps<T> {
  item: T;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export const MemoizedListItem = React.memo(
  ({ item, renderItem, keyExtractor }: MemoizedListItemProps<any>) => {
    const key = useMemo(() => keyExtractor(item), [item, keyExtractor]);

    return (
      <View key={key}>
        {renderItem(item)}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - retourner true si props sont identiques
    return prevProps.item === nextProps.item;
  }
);

// ✅ USAGE dans FlatList
<FlatList
  data={items}
  renderItem={({ item }) => (
    <MemoizedListItem
      item={item}
      renderItem={(i) => <ItemComponent item={i} />}
      keyExtractor={(i) => i.id}
    />
  )}
/>
```

---

## ✅ CHECKLIST - Avant Chaque Commit

```bash
# 1. Vérifier tous les useEffect ont des dépendances
grep -rn "useEffect(() =>" src/ | grep -v "\[\]" | wc -l

# 2. Vérifier pas de timers sans cleanup
grep -rn "setTimeout\|setInterval" src/ | grep -v "clearTimeout\|clearInterval" | wc -l

# 3. Vérifier pas de SharedValues en dépendances
grep -rn "useEffect.*useSharedValue\|useEffect.*\[.*Animated\|useEffect.*\[.*Animation" src/

# 4. Vérifier les imports utilisent les bons hooks
grep -rn "import { useAsync" src/ # Vérifier utilisation de custom hooks

# 5. Lancer ESLint
npm run lint

# 6. Lancer les tests
npm test
```

---

**💡 Conseil Pro** : Créer un fichier `.eslintrc.json` pour forcer les bonnes pratiques :

```json
{
  "extends": ["plugin:react-hooks/recommended"],
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "react-hooks/rules-of-hooks": "error"
  }
}
```

Ça vous forcera à respecter les règles des hooks et évitera 90% des bugs de re-render! 🚀
