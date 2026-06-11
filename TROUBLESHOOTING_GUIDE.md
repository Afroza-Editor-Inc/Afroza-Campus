# 🔧 Guide de Diagnostique & Troubleshooting

## 🚨 Problème: `TypeError: configs.toReversed is not a function`

### ✅ Solution Immédiate
```bash
# 1. Vérifier Node.js
node --version  # Doit être v20.x.x ou supérieur

# 2. Si Node < 20, upgrader
nvm use 20

# 3. Nettoyer et relancer
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile
rm -rf node_modules package-lock.json .expo
npm install --legacy-peer-deps
npm start
```

---

## 🚨 Problème: `Metro waiting on exp://10.0.0.16:8081` puis crash

### Causes
1. **Port occupé**: Un autre processus utilise le port 8081
2. **Cache corrompu**: `.expo` directory contient des données obsolètes
3. **Dépendances conflictuelles**: `node_modules` contient des versions incompatibles

### Solutions

#### Option 1: Changer de port
```bash
npm start -- --port 8082
```

#### Option 2: Tuer les processus existants
```bash
pkill -f "expo start"
pkill -f "metro"
pkill -f "node.*expo"

# Puis relancer
npm start
```

#### Option 3: Nettoyage complet
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus

# Nettoyer tous les caches
rm -rf frontend/mobile/.expo .expo
rm -rf frontend/mobile/node_modules node_modules
rm -rf frontend/mobile/package-lock.json package-lock.json

# Réinstaller
npm install --legacy-peer-deps
cd frontend/mobile && npm start
```

---

## 🚨 Problème: `Cannot find module '@react-navigation/native'`

### Cause
Les dépendances du workspace root ne sont pas installées

### Solution
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus
npm install --legacy-peer-deps --force
cd frontend/mobile && npm start
```

---

## 🚨 Problème: `EBADENGINE: Unsupported engine`

### Exemple
```
EBADENGINE required: { node: '>= 20.19.4' }, current: { node: 'v18.19.1' }
```

### Solution
```bash
# Activer Node 20
nvm use 20
node --version  # Vérifier que c'est v20.x.x

# Réinstaller
npm install --legacy-peer-deps
```

---

## ⚠️ Problème: App se lance mais crash dans Expo Go

### Checklist
- [ ] QR code peut être scanné ?
- [ ] App démarre mais error au chargement ?
- [ ] Vérifier la console du téléphone pour les erreurs

### Debug via Expo
```bash
# Dans le terminal Metro
Press j     # Ouvre le debugger
```

### Vérifier les sources TypeScript
```bash
# Compiler TypeScript pour vérifier les erreurs
cd frontend/mobile
npx tsc --noEmit
```

---

## 📊 Vérification Environnement Complet

```bash
#!/bin/bash

echo "=== Vérification Afroza Campus Environment ==="
echo ""

echo "Node.js Version:"
node --version

echo ""
echo "npm Version:"
npm --version

echo ""
echo "Expo Version:"
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile
npx expo --version

echo ""
echo "Metro Config Status:"
if [ -f "metro.config.js" ]; then
  echo "✅ metro.config.js exists"
else
  echo "❌ metro.config.js MISSING"
fi

echo ""
echo "Package.json Status:"
if [ -f "package.json" ]; then
  echo "✅ package.json exists"
  grep -E '"expo"|"react"|"react-native"' package.json | head -3
else
  echo "❌ package.json MISSING"
fi

echo ""
echo "node_modules Status:"
if [ -d "node_modules" ]; then
  echo "✅ node_modules exists ($(du -sh node_modules 2>/dev/null | cut -f1))"
else
  echo "❌ node_modules MISSING"
fi
```

---

## 🔍 Diagnostique Avancé

### Vérifier la résolution des modules
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

# Vérifier Metro config
node -e "const config = require('./metro.config.js'); console.log(JSON.stringify(config, null, 2))"
```

### Vérifier les dépendances conflictuelles
```bash
npm ls @react-navigation/native
npm ls react-native
npm ls expo
```

### Voir tous les warnings npm
```bash
npm list --depth=0
```

---

## 🚀 Performance & Optimization

### Nettoyer le cache Babel
```bash
rm -rf /tmp/babel-cache-* 2>/dev/null
rm -rf ~/.cache/babel-loader 2>/dev/null
```

### Augmenter la mémoire Node (si problèmes)
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Désactiver le cache Watchman (si problèmes)
```bash
npm start -- --no-watchman
```

---

## 📱 Test sur Appareil

### Android
```bash
# Terminal 1: Lancer Metro
npm start

# Terminal 2: Build & install
expo run:android
```

### iOS (macOS uniquement)
```bash
expo run:ios
```

### Web
```bash
expo start --web
```

---

## 📝 Logs Utiles

### Voir tous les logs du système
```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile
npm start -- --verbose
```

### Logs npm
```bash
cat ~/.npm/_logs/latest-debug-0.log
```

### Logs Expo
```bash
npx expo-doctor
```

---

## ✅ Checklist Après Réparation

- [ ] Node.js v20.x.x activé (`node --version`)
- [ ] `npm start` démarre sans erreur `toReversed`
- [ ] QR code affiché dans Metro
- [ ] App peut être scannée dans Expo Go
- [ ] Pas de crashes au lancement
- [ ] Console mobile ne montre pas d'erreurs critiques

---

## 🆘 Si Rien Ne Marche

### Reset Complet du Projet

```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus

# 1. Backup du code source (important!)
# ...

# 2. Nettoyage radical
rm -rf frontend/mobile/node_modules frontend/mobile/.expo frontend/mobile/.cache
rm -rf node_modules .expo .cache
rm -rf frontend/mobile/package-lock.json package-lock.json

# 3. Réinstallation depuis zéro
npm cache clean --force
npm install --legacy-peer-deps
cd frontend/mobile && npm install --legacy-peer-deps

# 4. Vérification
npm start
```

### Contacter Support
Si le problème persiste:
1. Exécuter `npx expo-doctor` et partager le rapport
2. Vérifier [Expo Docs](https://docs.expo.dev/)
3. Vérifier [React Native Docs](https://reactnative.dev/)

---

**Last Updated**: 22 avril 2026  
**Status**: ✅ Afroza Campus - Production Ready
