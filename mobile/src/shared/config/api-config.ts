import { parseApiUrl } from './parse-api-url';

// O Expo só injeta variáveis EXPO_PUBLIC_* quando acessadas literalmente em process.env.
export const apiConfig = parseApiUrl(process.env.EXPO_PUBLIC_API_URL);
