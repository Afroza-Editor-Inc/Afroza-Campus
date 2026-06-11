/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'Afroza Campus',
  slug: 'afroza-campus-mobile',
  owner: 'karel_33',
  version: '0.1.0',
  sdkVersion: '54.0.0',
  runtimeVersion: '54.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2B8AEB',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.afrozacampus.mobile',
  },
  android: {
    package: 'com.afrozacampus.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2B8AEB',
    },
    // react-native-keyboard-controller force adjustResize au runtime et expose la hauteur
    // animée du clavier (le composer suit le clavier sans double décalage). On laisse donc
    // le mode par défaut ici pour ne pas entrer en conflit avec la librairie.
    softwareKeyboardLayoutMode: 'resize',
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission:
          'Afroza Campus utilise la caméra pour prendre des photos et des vidéos dans vos discussions.',
        microphonePermission:
          'Afroza Campus utilise le micro pour enregistrer des vidéos et des notes vocales.',
        recordAudioAndroid: true,
      },
    ],
  ],
  extra: {
    graphqlUri: process.env.GRAPHQL_URI,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'b8a90f0f-66a6-4e24-b508-297c8520558e',
    },
  },
};
