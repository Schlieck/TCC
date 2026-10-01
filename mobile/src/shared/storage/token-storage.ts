import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'shifty.session-token';

/** Token guardado no Keystore/Keychain do aparelho, nunca no AsyncStorage. */
export const tokenStorage = {
  read: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  save: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
};
