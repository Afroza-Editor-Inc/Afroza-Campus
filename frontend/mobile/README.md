# Frontend Mobile — Afroza Campus

Application React Native / Expo SDK 54 pour Afroza Campus.

## Diagnostic du blocage Expo Go

Les causes principales identifiées sur ce projet sont :

- dépendance de navigation incomplète : `react-native-gesture-handler` manquait alors que la navigation React Navigation est utilisée dès le boot ;
- environnement de diagnostic masqué par un `.env.local` qui injectait `EXPO_NO_DOCTOR=1` et `EXPO_DEBUG=1` ;
- démarrage en mode inadapté pour un téléphone physique (`--offline` ou mauvais mode réseau) ;
- endpoints backend configurés sur `localhost`, ce qui casse l'accès depuis un appareil physique ;
- configuration Android locale mélangée entre `/usr/bin` et `$HOME/Android/Sdk`, ce qui empêchait la création d'AVD.

Le front a été stabilisé pour Expo SDK 54 avec :

- un bootstrap plus robuste ;
- un écran d'erreur visible au lieu d'un écran blanc si le démarrage échoue ;
- un splash plus court avec bouton `Continuer` ;
- une documentation Android et Expo Go corrigée.

## Prérequis

- Node.js 20 LTS recommandé
- npm 10+
- Java 17
- Android Studio + Android SDK + Android Emulator
- Expo CLI via `npx expo`
- EAS CLI via `npm install -g eas-cli`

## Installation

```bash
cd frontend/mobile
npm install
```

Si vous venez d'un état instable, utilisez :

```bash
npm run clean:install
```

## Variables utiles

Pour un backend local sur la machine de dev :

```bash
export EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
export GRAPHQL_URI=http://192.168.x.x:4000/graphql
```

Remplacez `192.168.x.x` par l'IP LAN du PC. Si ces variables ne sont pas définies, l'app tente de déduire l'IP de la machine Expo en mode développement.

## Lancement Expo Go

### Téléphone physique

Utilisez en priorité le LAN :

```bash
npm run start:lan
```

Si le téléphone n'est pas sur le même réseau Wi-Fi, passez au tunnel :

```bash
npm run start:tunnel
```

N'utilisez `npm run start:offline` que pour du diagnostic local, pas pour un premier test via QR code.

### Diagnostic conseillé

```bash
npm run doctor
npx expo config --json
npx tsc --noEmit
```

Si Ubuntu filtre les ports entrants, autorisez au minimum `8081` et vérifiez que le téléphone peut joindre l'IP LAN du PC.

## Lancement Android local

### Préparer l'environnement

Ajoutez ces variables dans `~/.bashrc` :

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
```

Rechargez le shell :

```bash
source ~/.bashrc
```

Vérifiez ensuite que les binaires pointent bien vers votre SDK utilisateur et non vers `/usr/bin` :

```bash
which sdkmanager
which avdmanager
which emulator
which adb
```

Si `sdkmanager` ou `avdmanager` pointent vers `/usr/bin/...`, installez d'abord `cmdline-tools` dans Android Studio (`SDK Manager` > `SDK Tools` > `Android SDK Command-line Tools (latest)`) puis rechargez le shell.

### Vérifier le SDK

```bash
adb version
emulator -version
sdkmanager --list | head
```

Pour éviter les conflits entre plusieurs installations du SDK, vous pouvez aussi forcer le SDK root :

```bash
sdkmanager --sdk_root="$ANDROID_HOME" --list | head
```

### Créer un émulateur

Exemple recommandé :

```bash
yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses
sdkmanager --sdk_root="$ANDROID_HOME" "platform-tools" "platforms;android-35" "build-tools;35.0.0" "emulator" "system-images;android-35;google_apis;x86_64"
avdmanager create avd -n AfrozaPixel -k "system-images;android-35;google_apis;x86_64" --device "pixel"
emulator -avd AfrozaPixel
```

Si `avdmanager` répond que le package n'existe pas, listez les images réellement installées puis créez l'AVD avec le chemin exact retourné :

```bash
find "$ANDROID_HOME/system-images" -maxdepth 4 -type d
avdmanager create avd -n AfrozaPixel -k "system-images;android-36.1;google_apis_playstore;x86_64" --device "pixel"
```

Un message `Unknown AVD name [AfrozaPixel]` signifie simplement que l'étape `create avd` a échoué avant que l'émulateur ne soit créé.

### Lancer l'application

```bash
npm run android
```

Ou :

```bash
npx expo run:android
```

## Vérifications utiles

```bash
npm run doctor
npm run doctor:fix
npx expo config --json
npx tsc --noEmit
```

## Build APK

Connexion EAS :

```bash
npm install -g eas-cli
eas login
```

Build APK de test :

```bash
eas build -p android --profile preview
```

Build APK avec dev client :

```bash
eas build -p android --profile development
```

Après le build, Expo fournit un lien de téléchargement. Téléchargez l'APK, copiez-le sur le téléphone puis installez-le, ou utilisez :

```bash
adb install chemin/vers/app.apk
```

Le profil `preview` génère un APK facile à partager pour les tests. Le profil `development` produit un dev client utile si vous voulez tester des modules natifs avec `expo run:android`.

## Guide pas a pas

1. Installer les dépendances :

```bash
cd frontend/mobile
npm install
```

2. Lancer Expo pour téléphone sur le même Wi-Fi :

```bash
npm run start:lan
```

3. Si le QR code charge dans le vide, basculer sur tunnel :

```bash
npm run start:tunnel
```

4. Vérifier l'état du projet :

```bash
npm run doctor
npx tsc --noEmit
```

5. Démarrer l'émulateur Android :

```bash
emulator -list-avds
emulator -avd AfrozaPixel
```

6. Lancer l'application dans l'émulateur sans QR code :

```bash
npx expo run:android
```

7. Générer un APK de test :

```bash
eas build -p android --profile preview
```

## Dépannage rapide

- QR code qui charge dans le vide : utilisez `npm run start:lan`, vérifiez que le téléphone et le PC sont sur le même Wi-Fi, puis testez `npm run start:tunnel`.
- QR code qui charge à l'infini sans UI : vérifiez que `react-native-gesture-handler` est bien installé, puis relancez avec `npm run start:lan`.
- Backend inaccessible depuis le téléphone : ne laissez pas `localhost` comme base URL, utilisez l'IP LAN du PC.
- Metro incohérent : relancez avec cache vidé via `npm start`.
- Android non détecté : vérifiez `adb devices`.
- `Package path is not valid` : `sdkmanager` et `avdmanager` n'utilisent pas le même SDK, ou le system image demandé n'est pas installé.
- Émulateur introuvable : ouvrez Android Studio > Device Manager et créez un AVD API 35.
- `expo-doctor` ne remonte rien : assurez-vous qu'aucune variable locale comme `EXPO_NO_DOCTOR=1` ne masque les contrôles.

## Scripts disponibles

```bash
npm start
npm run start:lan
npm run start:tunnel
npm run start:offline
npm run android
npm run ios
npm run doctor
npm run doctor:fix
npm run clean:install
```
