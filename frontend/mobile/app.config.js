/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'Afroza Campus',
  slug: 'afroza-campus-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2B8AEB',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.afrozacampus.mobile',
  },
  extra: {
    graphqlUri: process.env.GRAPHQL_URI,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || undefined,
    },
  },
};
