# Afroza Campus - Frontend

Front-end complet pour Afroza Campus, un réseau social étudiant moderne.

## Architecture

Le front-end est divisé en deux plateformes :

### 📱 Application Mobile

- **Framework**: React Native + Expo
- **Langage**: TypeScript
- **Navigation**: React Navigation
- **Plateformes**: Android, iOS

### 🖥️ Application Web

- **Framework**: Next.js
- **Langage**: TypeScript
- **API**: Apollo GraphQL
- **Style**: CSS-in-JS

## Fonctionnalités principales

### Authentification

- Inscription/Connexion
- Vérification OTP
- Gestion de session

### Réseau social

- Feed avec publications
- Stories/Historiques
- Interactions (like, commentaire, partage)
- Sauvegarde de publications

### Messagerie

- Chat privé
- Groupes
- Canaux (diffusion)

### Découverte

- Recherche d'utilisateurs/publications/groupes
- Suggestions personnalisées
- Exploration par catégories

### Profil utilisateur

- Gestion du profil
- Statistiques
- Grille de publications

## Données mock

Les applications utilisent des données mock partagées situées dans `frontend/shared/data/mock.ts` pour :

- Utilisateurs
- Publications
- Stories
- Messages
- Groupes
- Canaux

## Design system

- **Couleurs**: Blanc, Bleu (#2B8AEB), Vert (#24C48B)
- **Typographie**: Police système avec tailles standardisées
- **Composants**: Avatar, PostCard, Button, Input, etc.
- **Thème**: Configuré dans `theme/index.ts`

## Installation et lancement

### Mobile

```bash
cd mobile
npm install
npm start
```

### Web

```bash
cd web
npm install
npm run dev
```

## Structure des dossiers

```
frontend/
├── shared/           # Données et types partagés
│   └── data/
│       └── mock.ts
├── mobile/           # Application React Native
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   └── theme/
│   └── package.json
└── web/              # Application Next.js
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── theme/
    └── package.json
```

## État du développement

✅ Architecture complète
✅ Navigation fonctionnelle
✅ Composants de base
✅ Données mock
✅ Design system
✅ Écrans principaux
⏳ Intégration backend
⏳ Tests automatisés
⏳ Déploiement
