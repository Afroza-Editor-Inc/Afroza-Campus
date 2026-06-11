# MESSAGING_QA — Checklist qualité module messagerie

**Module :** `src/modules/messaging`  
**Navigation :** `MessagingNavigator` (17 routes)  
**Store :** `useMessagingStore`  
**Date :** 5 juin 2026

---

## Prérequis test

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd afroza-campus/frontend/mobile
npm start
```

- [ ] Expo Go ou Dev Build sur **iOS** et **Android**
- [ ] Compte mock chargé (données `mockData.ts`)

---

## 1. Navigation

| # | Scénario | iOS | Android | Notes |
|---|----------|-----|---------|-------|
| 1.1 | Onglet Messages → liste conversations | ☐ | ☐ | Route initiale `Conversations` |
| 1.2 | Tap conversation → `Chat` | ☐ | ☐ | `conversationId` dans params |
| 1.3 | Retour chat → liste | ☐ | ☐ | `goBack()` header |
| 1.4 | FAB → `NewChat` | ☐ | ☐ | FloatingButton offset tab bar |
| 1.5 | Menu ⋮ → panneau latéral | ☐ | ☐ | `MessagingSidePanelMenu` |
| 1.6 | NewChat → contact → chat direct | ☐ | ☐ | `openDirectConversation` |
| 1.7 | NewChat → créer groupe | ☐ | ☐ | `CreateGroup` |
| 1.8 | NewChat → créer contact | ☐ | ☐ | `CreateContact` |
| 1.9 | Header chat → profil | ☐ | ☐ | `ConversationProfile` |
| 1.10 | Profil → médias | ☐ | ☐ | `ConversationMedia` |
| 1.11 | Profil → préférences | ☐ | ☐ | `ConversationPreferences` |
| 1.12 | Profil → recherche dans chat | ☐ | ☐ | `ConversationSearch` |
| 1.13 | Paramètres messagerie | ☐ | ☐ | `MessagingSettings` |
| 1.14 | Fonds de discussion | ☐ | ☐ | `WallpaperPicker` / `MessagingSection` |
| 1.15 | Messages favoris | ☐ | ☐ | `StarredMessages` |
| 1.16 | Appareils connectés | ☐ | ☐ | `LinkedDevices` |
| 1.17 | QR Code | ☐ | ☐ | `QRCode` |
| 1.18 | Stack root `ChatRoom` (si utilisé) | ☐ | ☐ | Wrapper `screens/ChatRoom.tsx` |

---

## 2. Liste des conversations

| # | Scénario | iOS | Android |
|---|----------|-----|---------|
| 2.1 | Scroll fluide 20+ conversations | ☐ | ☐ |
| 2.2 | Pull-to-refresh | ☐ | ☐ |
| 2.3 | Filtres catégories (Tous, Non lus, …) | ☐ | ☐ |
| 2.4 | Recherche texte | ☐ | ☐ |
| 2.5 | Badge non-lu cohérent | ☐ | ☐ |
| 2.6 | Avatar + statut online (direct) | ☐ | ☐ |
| 2.7 | Appui long → menu contextuel | ☐ | ☐ |
| 2.8 | Tap avatar → preview | ☐ | ☐ |
| 2.9 | Alignements titre / heure / preview | ☐ | ☐ |
| 2.10 | État vide (aucun résultat) | ☐ | ☐ |

---

## 3. Chat — fonctionnel

| # | Scénario | iOS | Android |
|---|----------|-----|---------|
| 3.1 | Envoi texte | ☐ | ☐ |
| 3.2 | Réception mock / historique | ☐ | ☐ |
| 3.3 | Bulles envoyées (gradient brand) | ☐ | ☐ |
| 3.4 | Bulles reçues (fond surface) | ☐ | ☐ |
| 3.5 | Groupe : label expéditeur | ☐ | ☐ |
| 3.6 | Séparateurs jour | ☐ | ☐ |
| 3.7 | Statuts lecture (checks) | ☐ | ☐ |
| 3.8 | Réactions emoji (long press) | ☐ | ☐ |
| 3.9 | Pièces jointes : galerie | ☐ | ☐ |
| 3.10 | Pièces jointes : document | ☐ | ☐ |
| 3.11 | Pièces jointes : localisation | ☐ | ☐ |
| 3.12 | Pièces jointes : contact | ☐ | ☐ |
| 3.13 | Caméra / preview | ☐ | ☐ |
| 3.14 | Message vocal (long press mic) | ☐ | ☐ |
| 3.15 | Appels header (mock alert) | ☐ | ☐ |
| 3.16 | Menu chat ⋮ | ☐ | ☐ |
| 3.17 | Discussion bloquée → input désactivé | ☐ | ☐ |

---

## 4. Chat — clavier & input

| # | Scénario | iOS | Android |
|---|----------|-----|---------|
| 4.1 | Clavier ouvre sans masquer l’input | ☐ | ☐ |
| 4.2 | Clavier ferme — layout stable | ☐ | ☐ |
| 4.3 | `keyboardShouldPersistTaps` — tap bulle OK | ☐ | ☐ |
| 4.4 | Panneau emojis s’ouvre / ferme | ☐ | ☐ |
| 4.5 | Insertion emoji dans le draft | ☐ | ☐ |
| 4.6 | Onglet GIF — sélection | ☐ | ☐ |
| 4.7 | Onglet Stickers — sélection | ☐ | ☐ |
| 4.8 | Chips pièces jointes en attente | ☐ | ☐ |
| 4.9 | Safe area bas (encoche / barre nav) | ☐ | ☐ |
| 4.10 | Tab bar masquée quand clavier (onglet Messages) | ☐ | ☐ |

**Correctifs appliqués (à re-valider) :**

- `app.config.js` → `android.softwareKeyboardLayoutMode: 'resize'`
- `ChatScreen` → `KeyboardAvoidingView` : `behavior` uniquement sur iOS

---

## 5. Profils

| # | Scénario | iOS | Android |
|---|----------|-----|---------|
| 5.1 | Profil direct — hiérarchie infos | ☐ | ☐ |
| 5.2 | Profil groupe — participants | ☐ | ☐ |
| 5.3 | Actions : mute, block, médias | ☐ | ☐ |
| 5.4 | Navigation retour cohérente | ☐ | ☐ |

---

## 6. Performance perçue

| # | Scénario | iOS | Android |
|---|----------|-----|---------|
| 6.1 | Ouverture chat < 300 ms ressenti | ☐ | ☐ |
| 6.2 | Scroll historique 100+ messages | ☐ | ☐ |
| 6.3 | Pas de freeze envoi rapide | ☐ | ☐ |
| 6.4 | Pas de warning Reanimated console | ☐ | ☐ |

---

## 7. Régressions connues / hors scope

| Item | Statut |
|------|--------|
| RTC appels réels | Mock alert uniquement |
| GIF Tenor hors ligne | Échec chargement image attendu |
| Temps réel Phoenix | `realtime.ts` stub |
| `src/features/messaging` | Non utilisé — ne pas tester |

---

## 8. Critères d’acceptation phase stabilisation

- [ ] Tous les scénarios **1.x** et **2.x** passent sur les deux plateformes
- [ ] Scénarios **3.x** et **4.x** passent (priorité chat)
- [ ] Aucune erreur rouge Metro pendant le parcours complet
- [ ] `npx expo-doctor` → 18/18

---

## Sign-off

| Rôle | Nom | Date | OK |
|------|-----|------|-----|
| Dev | | | ☐ |
| QA | | | ☐ |
| Product | | | ☐ |
