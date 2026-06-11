# 🆘 GUIDE DE TROUBLESHOOTING - AFROZA MOBILE

**Pour chaque problème, consultez la section correspondante.**

---

## ❌ PROBLÈME: "ERROR Project is incompatible with this version of Expo Go"

### Cause
Le projet demande SDK 55, mais votre téléphone a Expo Go SDK 54.

### Solution
✅ **Déjà fixée** - Nous avons switché vers SDK 54

Vérifiez:
```bash
grep '"expo"' package.json
# Devrait montrer: "expo": "^54.0.0"

grep 'sdkVersion' app.config.js
# Devrait montrer: sdkVersion: '54.0.0'
```

### Si problème persiste
```bash
# Forcer réinstall complet
bash fix-afroza-mobile.sh
```

---

## ❌ PROBLÈME: "TypeError: fetch failed"

### Causes possibles
1. **Mode offline lancé par erreur**
2. **DNS/réseau instable**
3. **Cache Expo corrompu**
4. **Node 24 undici bug**

### Solution (étapes en ordre)

#### Étape 1: Vérifier connectivité
```bash
# Test internet
ping google.com -c 3

# Test DNS
nslookup api.github.com

# Test Registry
curl -s https://registry.npmjs.org/expo/latest | head -c 100
```

#### Étape 2: Nettoyez cache et reinstallez
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

npm cache clean --force
rm -rf node_modules package-lock.json .expo
npm install
```

#### Étape 3: Essayez mode offline
```bash
npm start:offline
```

#### Étape 4: Essayez mode LAN
```bash
npm start:lan
```

#### Étape 5: Node downgrade (dernière option)
```bash
# Si toujours erreur, Node 24 peut être problématique
nvm install 20
nvm use 20
npm start
```

---

## ❌ PROBLÈME: "Maximum update depth exceeded"

### Cause
Boucle infinie dans un composant React.

### Debugging
1. **Vérifier les logs**
```bash
# Dans le terminal Expo, cherchez les erreurs avant le "maximum"
# Notez le COMPOSANT dans les logs
```

2. **Composants suspects**:
```bash
# Cherchez les useEffect/useState avec dépendances
cd src/
grep -r "useState\|useEffect" --include="*.tsx"
```

3. **Fixes possibles** - Si ça vient de ces composants:
   - `useState` sans `useEffect` dependency → Ajouter dépendance
   - `useEffect` qui modifie state → Utiliser `useCallback`
   - Boucle circulaire → Examiner la logique

### Si vous trouvez le composant
```bash
# Contactez moi avec le nom du composant
# Ex: src/screens/FeedScreen.tsx ligne 42
```

---

## ❌ PROBLÈME: "SafeAreaView has been deprecated"

### Cause
Mauvaise import de SafeAreaView depuis `react-native`.

### Solution
✅ **Déjà fixée** dans `AppErrorBoundary.tsx`

Vérifiez qu'il n'en a pas ailleurs:
```bash
grep -r "import.*SafeAreaView.*from 'react-native'" src/
# Ne doit rien retourner
```

Si trouvé, corrigez:
```tsx
// ❌ ANCIEN
import { SafeAreaView } from 'react-native';

// ✅ NOUVEAU
import { SafeAreaView } from 'react-native-safe-area-context';
```

---

## ❌ PROBLÈME: "Port 8081 already in use"

### Cause
Un processus Metro Bundler est encore actif.

### Solution
```bash
# Trouvez le processus
lsof -i :8081

# Tuez-le
kill -9 <PID>

# Essayez de nouveau
npm start
```

Ou utilisez un port différent:
```bash
PORT=8082 npm start
```

---

## ❌ PROBLÈME: "Module not found" ou "Cannot find module"

### Cause
npm install incomplet ou corrompu.

### Solution
```bash
# Réinstall complet
rm -rf node_modules package-lock.json
npm install

# Si encore problème
npm cache clean --force
npm install
```

---

## ❌ PROBLÈME: "QR code won't scan with Expo Go"

### Cause
1. Métro Bundler n'est pas prêt
2. QR code incorrect
3. Version Expo Go ne correspond pas

### Solution

#### Étape 1: Vérifier Terminal Expo
```bash
# Vous devriez voir:
✓ Compiled successfully
Generated QR code...
To open app in Expo Go, scan the QR code above
```

Si vous ne voyez PAS ça, attendez 3-5 minutes (normal la première fois).

#### Étape 2: Vérifier QR
```bash
# Le QR devrait être visible + lisible
# Pas de texte dessus (sauf adresse IP)
```

#### Étape 3: Alternative manuelle
```bash
# Si scan échoue, utilisez ZIP Code
# Cherchez dans terminal Metro: "exp://"
# Entrez le lien zip code manuellement dans Expo Go

# Ex: exp://192.168.1.100:8081
```

#### Étape 4: Tester connectivité
```bash
# Sur le téléphone, vérifiez WiFi est le même que PC
# Les deux appareils doivent être sur le même réseau
```

---

## ❌ PROBLÈME: "App crashes immediately after loading"

### Information requise
1. **Exact error message** dans console
2. **Stack trace** (copier le message complet)
3. **Quel écran** fait crash?

### Debugging

#### Vérifier les logs
```bash
# Terminal Metro montre les logs
# Cherchez: ERROR, Error, Exception
```

#### Vérifier app.tsx
```bash
# L'erreur vient souvent du composant root
cat src/screens/SplashScreen.tsx | head -30
```

#### Vérifier GraphQL/API
```bash
# Si l'app arrive au login et crash:
# Ça peut être connexion API

# Testez sans API:
npm start:offline
```

---

## ❌ PROBLÈME: "Expo doctor shows many warnings"

### Cause
Versions incompatibles mineures.

### Solution
```bash
# Laisser npm installer automatically
npm run doctor:fix

# Réinstaller
npm install
```

### Si déjà corrigé
```bash
# Vérifier versions
npm list expo react react-native --depth=0

# Tout devrait être SDK 54
```

---

## ❌ PROBLÈME: "npm install is very slow or hangs"

### Cause
1. NPM Registry lent
2. Network timeout
3. Cache corrompu

### Solution

#### Étape 1: Registry change
```bash
# Utilisez un registry différent
npm config set registry https://registry.npmmirror.com

# Essayez install
npm install

# Revenir au registry original
npm config set registry https://registry.npmjs.org
```

#### Étape 2: Utilisez yarn (si disponible)
```bash
# Installer yarn
npm install -g yarn

# Puis
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile
yarn install
```

#### Étape 3: Cache clean aggressive
```bash
npm cache clean --force
npm ci  # Clean install
```

---

## ❌ PROBLÈME: "Cannot find expo or npm command"

### Cause
Node/npm pas dans PATH.

### Solution
```bash
# Vérifier installation
which node
which npm

# Si rien, installer Node
# Télécharger depuis nodejs.org
# OU utiliser nvm

nvm install 20
nvm use 20
```

---

## ✅ TOUS LES SYMPTÔMES VÉRIFIÉS

Effectuez cette checklist:

```bash
# 1. Versions
node --version          # v20.x.x ou plus
npm --version           # 10.x.x ou plus

# 2. Dépendances
grep '"expo"' package.json       # "expo": "^54.0.0"
grep 'sdkVersion' app.config.js  # sdkVersion: '54.0.0'

# 3. npm health
npm list expo           # Pas de dépendances multiples
npm audit              # 0 vulnerabilities

# 4. Code
grep "react-native.*SafeAreaView" src/**/*.tsx || echo "✅ OK"
```

---

## 📞 SI TOUJOURS BLOQUÉ

Activez le mode debug:

```bash
# Run avec verbose logging
DEBUG=* npm start 2>&1 | tee debug.log

# Attendez 5 minutes, puis arrêtez (CTRL+C)
# Consultez debug.log pour voir les vrais erreurs
```

Puis contactez-moi avec:
1. Le fichier debug.log
2. Output de `npm list`
3. Version Node/npm exacte
4. OS (Ubuntu version)

---

## 🚀 RESTORATION RAPIDE

Si tout est cassé, réinitialiser complet:

```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

# Option 1: Script automatique
bash fix-afroza-mobile.sh

# Option 2: Manual
rm -rf node_modules package-lock.json .expo
npm cache clean --force
rm package.json
cp FIXED_PACKAGE.json package.json
npm install
npm start
```

---

**Dernier recours**: Contactez moi avec les logs et détails du problème.
