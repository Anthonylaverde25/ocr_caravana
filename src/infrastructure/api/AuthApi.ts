import { api } from './ApiClient';
import { AuthSession, Company } from '../storage/AuthStore';

interface LoginResponse {
  user: { name: string };
  access_token: string;
  companies: { data?: Company[] } | Company[];
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await api.post<LoginResponse>('/login', { email, password });
  const companies = (Array.isArray(data.companies) ? data.companies : data.companies.data ?? [])
    .map((c) => ({ id: c.id, name: c.name }));

  if (companies.length === 0) {
    throw new Error('El usuario no pertenece a ninguna empresa');
  }

  return { token: data.access_token, userName: data.user.name, company: companies[0], companies };
}
