import axios, { AxiosError } from 'axios';
import { AuthStore } from '../storage/AuthStore';

/** The Mac's LAN address as the phone sees it (see api-laravel DEV_LAN_HOST). */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const auth = await AuthStore.get();
  if (auth) {
    config.headers.Authorization = `Bearer ${auth.token}`;
    config.headers['X-Company-ID'] = String(auth.company.id);
  }
  return config;
});

/** Some list endpoints wrap their items in `data` and some do not. */
export function unwrap<T>(body: T[] | { data: T[] }): T[] {
  return Array.isArray(body) ? body : body.data;
}

/** No answer at all (network down, timeout): the request may or may not have landed. */
export function isNoAnswer(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response === undefined;
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<{ message?: string }>;
    if (!e.response) return 'Sin conexión con el sistema';
    return e.response.data?.message ?? `Error ${e.response.status}`;
  }
  return error instanceof Error ? error.message : 'Error inesperado';
}
