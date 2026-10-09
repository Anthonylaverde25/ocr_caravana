import { MMKV } from 'react-native-mmkv';
import { api } from './ApiClient';

export interface HerdSummary {
  total: number;
  /** ISO 8601, when the server counted. */
  updatedAt: string;
}

export interface HerdSummaryResult {
  /** Null only when the server never answered for this company and nothing is cached. */
  summary: HerdSummary | null;
  fromCache: boolean;
}

const storage = new MMKV({ id: 'herd-summary' });

/** One copy per company: switching companies offline must not show the other one's herd. */
const cacheKey = (companyId: number) => `company:${companyId}`;

export const HerdSummaryApi = {
  /** The last known count stays on the phone, so the home screen has a number without signal. */
  async get(companyId: number): Promise<HerdSummaryResult> {
    try {
      const { data } = await api.get<{ data: { total: number; updated_at: string } }>('/dashboard/herd-summary');
      const summary: HerdSummary = { total: data.data.total, updatedAt: data.data.updated_at };
      storage.set(cacheKey(companyId), JSON.stringify(summary));
      return { summary, fromCache: false };
    } catch {
      const cached = storage.getString(cacheKey(companyId));
      if (!cached) return { summary: null, fromCache: false };
      try {
        return { summary: JSON.parse(cached) as HerdSummary, fromCache: true };
      } catch {
        return { summary: null, fromCache: false };
      }
    }
  },
};
