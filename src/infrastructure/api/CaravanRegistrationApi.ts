import axios from 'axios';
import { LookupStatus, RegisterRow } from '../../core/entities/RegistrationSession';
import { api } from './ApiClient';

export type KnownStatus = Exclude<LookupStatus, 'unchecked'>;

export interface LookupResult {
  identification: string;
  status: KnownStatus;
  caravan_id?: number;
  batch_name?: string | null;
}

export type RegisterOutcome =
  | { kind: 'registered'; count: number }
  | { kind: 'conflict'; message: string; conflicts: { identification: string; status: KnownStatus }[] }
  | { kind: 'invalid'; message: string };

const LOOKUP_BATCH = 50;

export const CaravanRegistrationApi = {
  async lookup(identifications: string[]): Promise<LookupResult[]> {
    const results: LookupResult[] = [];
    for (let i = 0; i < identifications.length; i += LOOKUP_BATCH) {
      const { data } = await api.post<{ data: LookupResult[] }>('/caravans/lookup', {
        identifications: identifications.slice(i, i + LOOKUP_BATCH),
      });
      results.push(...data.data);
    }
    return results;
  },

  /** Network failures are rethrown: the caller must treat them as "maybe registered". */
  async registerNew(submissionId: string, rows: RegisterRow[]): Promise<RegisterOutcome> {
    try {
      const { data } = await api.post<{ data: { registered: number } }>('/caravans/register-new', {
        submission_id: submissionId,
        caravans: rows,
      });
      return { kind: 'registered', count: data.data.registered };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return { kind: 'conflict', message: error.response.data.message, conflicts: error.response.data.conflicts };
      }
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        return { kind: 'invalid', message: error.response.data.message ?? 'Datos inválidos' };
      }
      throw error;
    }
  },
};
