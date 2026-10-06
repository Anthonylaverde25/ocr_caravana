import * as SecureStore from 'expo-secure-store';

export interface Company {
  id: number;
  name: string;
}

export interface AuthSession {
  token: string;
  userName: string;
  company: Company;
  companies: Company[];
}

const KEY = 'auth_session';
let cache: AuthSession | null | undefined;

export const AuthStore = {
  async get(): Promise<AuthSession | null> {
    if (cache === undefined) {
      const raw = await SecureStore.getItemAsync(KEY);
      cache = raw ? (JSON.parse(raw) as AuthSession) : null;
    }
    return cache;
  },

  async set(session: AuthSession): Promise<void> {
    cache = session;
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  },

  async clear(): Promise<void> {
    cache = null;
    await SecureStore.deleteItemAsync(KEY);
  },
};
