import Constants from 'expo-constants';

function readExpoHostUri(): string | null {
  const expoConfigHost = Constants.expoConfig?.hostUri;
  const manifestDebuggerHost = (Constants as any).manifest?.debuggerHost;
  const manifest2Host = (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  return expoConfigHost || manifest2Host || manifestDebuggerHost || null;
}

function readHostName(): string | null {
  const hostUri = readExpoHostUri();

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

function resolveApiBaseUrl(): string {
  const explicitApiBaseUrl =
    process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiBaseUrl;

  if (explicitApiBaseUrl) {
    return explicitApiBaseUrl.replace(/\/$/, '');
  }

  const expoHost = readHostName();

  if (expoHost) {
    return `http://${expoHost}:4000`;
  }

  return 'http://localhost:4000';
}

export const API_BASE_URL = resolveApiBaseUrl();
export const GRAPHQL_ENDPOINT =
  Constants.expoConfig?.extra?.graphqlUri || `${API_BASE_URL}/graphql`;
export const PHOENIX_SOCKET_ENDPOINT = API_BASE_URL.replace(/^http/, 'ws').replace(
  /:4000$/,
  ':4001'
) + '/socket';
