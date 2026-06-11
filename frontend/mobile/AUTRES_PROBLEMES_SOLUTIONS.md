# ⚠️ AUTRES PROBLÈMES & SOLUTIONS - AFROZA CAMPUS

Vos problèmes signalés et solutions si toujours présents après SDK 54 fix.

---

## 🔴 PROBLÈME 2: Erreur Réseau (TypeError: fetch failed)

### Symptôme
```
TypeError: fetch failed
at getNativeModuleVersions()
expo-cli trying to reach api.expo.dev
```

### Cause Possible
- Problème réseau/DNS
- npm cache corrompu
- Proxy réseau
- Mode offline Expo

### Solutions (Ordre)

#### Solution 1: Diagnostic réseau
```bash
ping -c 3 8.8.8.8        # Test internet
nslookup api.expo.dev    # Test DNS
curl https://api.expo.dev/v2/versions  # Test Expo API
```

#### Solution 2: Mode offline
```bash
npm start --offline
# ou
npm run start:offline
```

#### Solution 3: Nettoyage cache
```bash
npm cache clean --force
npm cache verify
watchman watch-del-all
```

#### Solution 4: Node.js downgrade (ultime)
```bash
# Si toujours erreur, downgrade Node de 24 à 20 LTS
nvm install 20
nvm use 20
npm start
```

---

## 🔴 PROBLÈME 3: Boucle Infinie React (Maximum update depth exceeded)

### Symptôme
```
Error: Maximum update depth exceeded
The result of getSnapshot should be cached
```

### Cause Possible
- useEffect dépendances incorrectes
- setState appelé dans render
- Boucle dans handler
- Zustand state mal utilisé

### Fichiers Suspects
- `src/screens/FeedScreen.tsx`
- `src/features/messaging/screens/ChatRoomScreen.tsx`
- `src/navigation/MagicBottomTab.tsx`
- `src/components/messaging/TypingIndicator.tsx`

### Vérification Rapide
```bash
# Chercher les patterns dangereux
grep -r "useState.*setState" src/
grep -r "useEffect.*\[.*\]" src/ | grep -v "^\[" 
grep -r "getSnapshot" src/
```

### Exemple Fix: FeedScreen.tsx

**❌ Avant (problématique)**:
```typescript
const [data, setData] = useState([]);

useEffect(() => {
  const handler = () => setData([...data, newItem]); // ⚠️ data dans deps manquante
  return () => {}; // ⚠️ pas de cleanup
}, []); // ⚠️ deps vides mais utilise data

// Dans render directement
const loadMore = () => setData([...data, newItem]); // ⚠️ créé à chaque render
```

**✅ Après (correct)**:
```typescript
const [data, setData] = useState([]);

useEffect(() => {
  const handler = () => setData(prev => [...prev, newItem]); // ✓ use prev
  return () => { /* cleanup */ }; // ✓ cleanup
}, []); // ✓ stable dependencies

// Wrapped in useCallback
const loadMore = useCallback(() => {
  setData(prev => [...prev, newItem]);
}, []); // ✓ stable reference
```

### Solution Complète
```bash
# 1. Vérifiez dépendances useEffect
# 2. Utilisez prev => {} au lieu de setState(value)
# 3. Wrappez handlers dans useCallback
# 4. Testez en lançant app
npm start

# Si toujours présent:
# 5. Vérifiez Zustand store (si utilisé)
# 6. Check pour des setState en boucles
```

---

## 🔴 PROBLÈME 4: getSnapshot Error

### Symptôme
```
Error: The result of getSnapshot should be cached
```

### Cause Possible
- Zustand store retourne nouvelle référence
- useSyncExternalStore mal utilisé
- State store mutabilité

### Vérification
```bash
grep -r "getSnapshot" src/
grep -r "useSyncExternalStore" src/
```

### Fix pour Zustand
```typescript
// ❌ MAUVAIS: Nouvelle référence chaque fois
const state = useStore((s) => ({ 
  user: s.user,
  posts: s.posts 
}));

// ✅ BON: Shallow compare ou selector précis
const user = useStore((s) => s.user);  // Seulement ce qu'il faut
const posts = useStore((s) => s.posts);
```

---

## ⚠️ PROBLÈME 5: SafeAreaView Deprecated

### Symptôme  
```
Warning: SafeAreaView has been deprecated
Use react-native-safe-area-context instead
```

### Status: ✅ DÉJÀ CORRECT!

Your project imports from correct location:
```typescript
import { SafeAreaView } from 'react-native-safe-area-context'; // ✓ Correct
```

NOT from deprecated:
```typescript
import { SafeAreaView } from 'react-native'; // ✗ Déprécié
```

**No action needed** - Your app is properly configured.

---

## 🔴 PROBLÈME 6: Conflits de Dépendances

### Symptôme
```
npm ERR! peer dep needed
npm ERR! conflicting peer
```

### Quick Fix
```bash
npm install --force
```

### Proper Fix
```bash
# 1. Vérified app.config.js sdkVersion
# 2. List conflicts
npm ls --depth=0

# 3. Install specific versions
npm install expo@^54.0.0 --save

# 4. Verify
npm list expo
```

---

## 📊 DIAGNOSTIC COMPLET

### Script de diagnostic
```bash
#!/bin/bash
cd frontend/mobile

echo "=== EXPO 54 DIAGNOSTIC ==="
echo "SDK Version:"
grep sdkVersion app.config.js

echo ""
echo "Package.json versions:"
grep -A 15 "expo" package.json

echo ""
echo "Node.js:"
node --version

echo ""
echo "npm:"
npm --version

echo ""
echo "Installed packages:"
npm ls --depth=0 | head -20

echo ""
echo "React Native version:"
npx react-native --version

echo ""
echo "Expo version:"
npx expo --version
```

### Run diagnostic
```bash
bash diagnostic.sh  # ou comparez avec output ci-haut
```

---

## 🛠️ COMMANDES D'URGENCE

Si tout échoue:

```bash
# Clean complètement
rm -rf node_modules package-lock.json .expo
npm cache clean --force

# Réinstaller
npm install

# Test
npm start --offline

# Force rebuild
rm -rf .expo node_modules
npm install --force
npm start
```

---

## 📱 TESTER MANUELLEMENT

```bash
# Start Expo
npm start

# Quand Metro termine:
# Attendez QR code
# Ouvrez Expo Go SDK 54
# Scannez
# Testez:
# - Navigation
# - Buttons/interactions
# - Console pour erreurs
```

---

## 🆘 SI TOUJOURS PROBLÈMES

1. **Erreur incompatibilité**: Versions encore mélangées
   - Vérifiez `npm ls expo`
   - Vérifiez `grep expo package.json`

2. **fetch failed**: Réseau
   - Testez: `curl https://api.expo.dev`
   - Essayez: `npm start --offline`

3. **Maximum update depth**: Bug React
   - Cherchez dépendances manquantes
   - Cherchez setState dans render
   - Testez avec mode debug React

4. **QR code doesn't work**: Expo Go version
   - Vérifiez version Expo Go (doit être SDK 54)
   - Reinstall Expo Go

---

## 🎯 SUMMARY

| Problème | Visible | Fix |
|----------|---------|-----|
| Incompatible version | ❌ Errors | Versions Expo corriges ✅ |
| fetch failed | ❌ Errors | Réseau/offline mode |
| Max update depth | ❌ Crash | Vérifier useEffect deps |
| getSnapshot issue | ⚠️ Warning | Fixes Zustand |
| SafeAreaView | ⚠️ Warning | ✅ Déjà correct |

---

**Next**: Lancez `npm start` et testez sur Expo Go! 🚀
