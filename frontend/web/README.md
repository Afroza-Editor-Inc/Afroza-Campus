# Frontend Web — Afroza Campus

Application web Next.js pour Afroza Campus, offrant une expérience desktop complète.

## Technologies

- Next.js 13
- TypeScript
- Apollo GraphQL
- React

## Fonctionnalités

- Feed avec publications et stories
- Messagerie instantanée
- Recherche et découverte d'utilisateurs/groupes/canaux
- Profils utilisateurs
- Groupes et canaux

## Installation

```bash
npm install
```

## Lancement

```bash
# Mode développement
npm run dev

# Build pour production
npm run build
npm start
```

## Structure du projet

```
src/
├── components/     # Composants réutilisables
├── pages/          # Pages Next.js
├── styles/         # Styles CSS
├── services/       # Services API
├── hooks/          # Hooks personnalisés
└── theme/          # Configuration du thème
```

## Architecture

L'application utilise :

- Next.js pour le rendu côté serveur et le routing
- Apollo Client pour les requêtes GraphQL
- Architecture component-based avec hooks React
- Données mock partagées avec l'application mobile
