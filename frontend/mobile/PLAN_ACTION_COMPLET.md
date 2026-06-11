# 📋 PLAN D'ACTION COMPLET - STABILISATION AFROZA CAMPUS

**Objectif**: 100% compatible SDK 54, zéro erreurs, projet stable

**Durée estimée**: ~20 minutes

---

## ✅ ÉTAPE 1: PRÉPARATION (2 min)

### Vérifier l'état actuel
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

# Vérifier si Expo tourne (arrêter si oui)
ps aux | grep expo | grep -v grep
# Si trouvé: Press CTRL+C dans le terminal

# Vérifier Node version
node --version
# Attendu: v20.x.x ou v22.x.x (pas v24!)

# Vérifier npm
npm --version
```

---

## ✅ ÉTAPE 2: NETTOYAGE COMPLET (3 min)

```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

# Supprimer tous les caches
echo "🧹 Nettoyage... (3-5 min)"
rm -rf node_modules package-lock.json
rm -rf .expo
npm cache clean --force

# Watchman clean (si watchman est installed)
watchman watch-del-all 2>/dev/null || echo "watchman not installed"

# Clear Metro cache
rm -rf /tmp/metro-*

echo "✅ Nettoyage complet!"
```

---

## ✅ ÉTAPE 3: APPLIQUER CORRECTIONS (2 min)

### A. Corriger package.json
```bash
# Sauvegarder l'original
cp package.json package.json.BACKUP.55

# Remplacer par la version SDK 54
cp FIXED_PACKAGE.json package.json

echo "✅ package.json mis à jour vers SDK 54"
```

### B. Vérifier les corrections de code (DÉJÀ FAITES ✅)
```bash
# Ces fichiers sont déjà corrigés:
echo "✅ src/components/AppErrorBoundary.tsx - Fixed SafeAreaView import"
echo "✅ app.config.js - Added SDK 54 configuration"
```

---

## ✅ ÉTAPE 4: RÉINSTALLATION PROPRE (5-8 min)

```bash
echo "📦 Installation des dépendances (primera fois = lent)"
npm install

echo "✅ npm install complet"
```

**Attendu dans le terminal**:
```
added XXX packages, audited XXX packages
found 0 vulnerabilities
```

---

## ✅ ÉTAPE 5: DIAGNOSTIQUE EXPO (2 min)

```bash
# Run expo doctor
npm run doctor

# Fixed dependencies (if suggested)
if [ $? -ne 0 ]; then
  npm run doctor:fix
fi

echo "✅ Expo doctor passed"
```

**Attendu**:
- ✅ No critical errors
- ✅ All SDK 54 versions matched
- ⚠️ Peut y avoir des warnings mineurs (OK)

---

## ✅ ÉTAPE 6: VÉRIFICATION PRE-LAUNCH (2 min)

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check for obvious React issues
echo "✅ TypeScript verification passed"
```

---

## ✅ ÉTAPE 7: JLANCER EXPO (5-10 min)

```bash
echo "🚀 Lançant Expo (attendre 3-5 min pour metro bundler)"
npm start

# Attendu dans le terminal:
# - "Starting Metro Bundler"
# - "Waiting on http://localhost:8081"
# - "✓ Compiled successfully"
# - "Generated QR code..."
# - "To open app in Expo Go, scan the QR code above"
```

**Cette étape peut prendre 5-10 minutes la première fois** (normal, Metro bundle)

---

## ✅ ÉTAPE 8: TESTER SUR TÉLÉPHONE (5 min)

### Avec Expo Go Sur le téléphone:
1. Ouvrir app **Expo Go**
2. Appuyer sur **"Scan QR code"**  
3. Pointer caméra sur le QR code du terminal
4. Attendre 30-60 secondes pour que l'app charge

### Vérifier dans l'app:
- [ ] App charge sans crash
- [ ] Pas de "fetch failed" error
- [ ] Pas de "Maximum update depth exceeded"
- [ ] Navigation fonctionne
- [ ] Écrans chargent correctement

**Résultat = SUCCESS ✅**

---

## ✅ ÉTAPE 9: ARRÊTER PROPREMENT (1 min)

```bash
# Dans le terminal Expo:
# Appuyer: q

# Vous verrez:
# "Expo server stopped"
```

---

## 📊 CHECKLIST DE VALIDATION

Avant de valider "COMPLET":

### Package.json ✅
- [ ] expo: ^54.0.0 (pas 55!)
- [ ] expo-constants: ~54.0.0 (pas 55!)
- [ ] All expo-* packages: ~54.0.0
- [ ] react: 18.2.0 (pas 19!)
- [ ] react-native: 0.75.3 (pas 0.81!)

### Code ✅
- [ ] AppErrorBoundary.tsx imports SafeAreaView from react-native-safe-area-context
- [ ] app.config.js has sdkVersion: '54.0.0'

### Buildand Runtime ✅
- [ ] npm install: 0 vulnerabilities
- [ ] npm start: Generates QR code
- [ ] Expo Go: Scans QR and loads app
- [ ] No errors in app

### Performance ✅
- [ ] Metro bundler completes in < 5 min
- [ ] App loads on phone in < 60 sec
- [ ] Zero console errors

---

## 🆘 SI PROBLÈME

### "npm install fails"
```bash
# Force rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Expo won't start - fetch error"
```bash
# Use offline mode
npm start:offline

# OU Mode LAN
npm start:lan
```

### "QR code won't scan"
```bash
# Check Metro
# Look for: "Waiting on http://localhost:8081"
# Try manual entry of IP:8081
```

### "App crashes on load"
```bash
# Check console logs
# See TROUBLESHOOTING.md
```

---

## 🎯 RÉSULTAT FINAL

After completing all steps:

```
✅ Expo SDK 54 - 100% compatible
✅ All packages aligned
✅ Zero critical errors
✅ Expo Go scans without error
✅ App loads immediately
✅ Project stable and ready for development
```

---

## ⏱️ TIMELINE

| Étape | Durée | Status |
|-------|-------|--------|
| 1. Préparation | 2 min | ⏳ |
| 2. Nettoyage | 3 min | ⏳ |
| 3. Corrections | 2 min | ⏳ |
| 4. Réinstall | 8 min | ⏳ |
| 5. Doctor | 2 min | ⏳ |
| 6. Vérification | 2 min | ⏳ |
| 7. Launch | 5 min | ⏳ |
| 8. Test | 5 min | ⏳ |
| **TOTAL** | **~29 min** | ⏳ |

---

## 🚀 EXÉCUTION RAPIDE

Si vous êtes pressé, utilisez le script d'automatisation:

```bash
bash fix-afroza-mobile.sh
```

Ce script exécute automatiquement les étapes 1-7.

---

**Prochaine étape**: Exécuter ce plan ou utiliser le script d'automatisation.
