# 🚀 DÉMARRAGE RAPIDE - Afroza Campus Mobile

## ⚡ TL;DR - Lancer en 3 étapes

```bash
# 1. Activer Node 20
nvm use 20

# 2. Naviguer au projet
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

# 3. Démarrer
npm start
```

**Puis scannez le QR code avec Expo Go** ✅

---

## 🔑 POINT CRITIQUE

**⚠️ TOUJOURS utiliser Node 20+**

```bash
# Vérifier
node --version  # Doit être v20.x.x

# Si ce n'est pas le cas
nvm use 20
```

**Pourquoi?** L'erreur `toReversed is not a function` = Node 18 utilisé. ES2023 requiert Node 20+.

---

## 📦 Installation Complète (Si Besoin)

```bash
cd /home/karel/Documents/Afroza_Campus/afroza-campus/frontend/mobile

# Activer Node 20
nvm use 20

# Nettoyer
rm -rf node_modules package-lock.json .expo

# Réinstaller
npm install

# Lancer
npm start
```

---

## 📱 Une Fois Metro Démarré

Vous verrez ceci:
```
Starting Metro Bundler
warning: Bundler cache is empty, rebuilding...

[QR Code ASCII Art]

› Metro waiting on exp://YOUR_IP:8081
› Scan the QR code above with Expo Go
```

**Actions disponibles:**
- `a` → Ouvrir sur Android
- `w` → Ouvrir sur Web  
- `r` → Recharger l'app
- `j` → Ouvrir le debugger
- `m` → Voir les options
- `Ctrl+C` → Arrêter

---

## 🆘 Si Ça Ne Marche Pas

### Erreur: `toReversed is not a function`
```bash
node --version  # Vérifier Node 20+
nvm use 20      # Activer Node 20
npm start       # Relancer
```

### Erreur: Port 8081 occupé
```bash
npm start -- --port 8082
# OU
pkill -f "expo start"
npm start
```

### Erreur: Modules manquants
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📁 Structure Finale (Correcte)

```
/afroza-campus/
├── package.json                    (SANS workspaces)
├── frontend/mobile/
│   ├── package.json               (avec dépendances)
│   ├── node_modules/              (dépendances locales)
│   ├── App.tsx
│   └── app.config.js
└── ...
```

**Important**: NO `node_modules` au root, NO `metro.config.js` (Expo gère)

---

## ✅ Checklist Avant Développement

- [ ] `node --version` → v20.x.x
- [ ] `npm start` → QR code visible
- [ ] **Zéro** erreur `toReversed`
- [ ] App scan dans Expo Go → OK
- [ ] Console téléphone → aucune erreur critique

---

**Créé**: 23 avril 2026  
**Status**: ✅ Prêt pour développement UI/UX
