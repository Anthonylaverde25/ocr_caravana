import axios from 'axios';
import { MMKV } from 'react-native-mmkv';
import type { ReceptionTroop, RowError } from '../../core/entry-orders/reception';
import { api, isNoAnswer, unwrap } from './ApiClient';

const storage = new MMKV({
  id: 'entry-order-storage',
});
const CACHE_KEY = 'entry_orders_cached';
const CACHE_AT_KEY = 'entry_orders_cached_at';

export interface EntryOrderDteSummary {
  id: number;
  dte_number: string;
  dte_date: string;
  head_count: number;
  received_count: number;
  caravaned_count: number;
  /** Head received by count whose caravan is still to write. */
  uncaravaned_count: number;
  to_identify_count?: number;
  pending_count: number;
  missing_head_count: number;
  observations?: string | null;
}

export interface EntryOrderCategory {
  position: number;
  name: string | null;
  sex: 'M' | 'H' | 'BOTH' | null;
}

export interface EntryOrderBreedLine {
  position: number;
  letter: string;
  breed_name: string | null;
  color_name: string | null;
  label: string;
}

/** AWAITING_DTE, IN_TRANSIT, RECEIVED (received, caravans still to write), COMPLETED, CLOSED_INCOMPLETE… */
export type EntryOrderStatus = 'DRAFT' | 'AWAITING_DTE' | 'IN_TRANSIT' | 'RECEIVED' | 'COMPLETED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';

export interface EntryOrderSummary {
  id: number;
  code: string;
  number: number;
  status: EntryOrderStatus;
  status_label: string;
  accepts_reception: boolean;
  batch_name?: string | null;
  head_count: number;
  in_transit_count: number;
  received_count: number;
  uncaravaned_count?: number;
  sex_composition: 'MALE' | 'FEMALE' | 'MIXED' | null;
  categories: EntryOrderCategory[];
  needs_category_per_animal: boolean;
  breeds: EntryOrderBreedLine[];
  provider?: {
    id: number;
    name: string;
    cuit?: string;
  } | null;
  farm?: {
    id: number;
    name: string;
    renspa?: string;
  } | null;
  dtes: EntryOrderDteSummary[];
  created_at?: string;
}

/** An animal received: what the order leaves open about it, by the order's line positions. */
export interface ReceiveAnimalItem {
  caravana: string;
  sex?: 'M' | 'H' | null;
  category_position?: number | null;
  breed_position?: number | null;
  weight?: number | null;
}

export interface ReceiveDtePayload {
  method: 'MANUAL';
  received_at: string;
  dte_id: number;
  /** Head that arrived, confirmed against the DTE: closes it. Null when only identifying head already received. */
  received_head_count?: number | null;
  reason?: string | null;
  animals: ReceiveAnimalItem[];
}

export interface ReceiveDteResult {
  order: EntryOrderSummary;
  warnings?: { code: string; message: string; row?: number }[];
}

/** The orders, and whether they came from the server or from the copy kept for working without signal. */
export interface EntryOrderList {
  orders: EntryOrderSummary[];
  /** When the copy shown was saved; null when it is fresh from the server. */
  offlineSince: string | null;
}

/** What the order declares about its animals, as the reception rules read it. */
export function troopOf(order: EntryOrderSummary): ReceptionTroop {
  return {
    sexComposition: order.sex_composition,
    categories: order.categories.map((c) => ({ position: c.position, name: c.name ?? String(c.position), sex: c.sex })),
    breeds: order.breeds.map((b) => ({ position: b.position, breedName: b.breed_name ?? b.label, colorName: b.color_name })),
    needsCategoryPerAnimal: order.needs_category_per_animal,
  };
}

/** The problems of a rejected reception: the general one, and the ones of each animal sent. */
export function receptionErrorsOf(error: unknown): { message: string | null; rows: RowError[] } {
  if (!axios.isAxiosError(error) || !error.response) return { message: null, rows: [] };

  const body = error.response.data as { message?: string; header_errors?: { message: string }[]; row_errors?: RowError[] } | undefined;
  const header = body?.header_errors?.map((e) => e.message).join(' ');

  return { message: header || body?.message || null, rows: body?.row_errors ?? [] };
}

export const EntryOrderApi = {
  /**
   * The entry orders of the active company. Without signal (no answer from the server) the last
   * copy kept is shown and said so; any answer of the server — even an error — is not hidden
   * behind an old copy, which could list orders that no longer exist.
   */
  async list(): Promise<EntryOrderList> {
    try {
      const res = await api.get<EntryOrderSummary[] | { data: EntryOrderSummary[] }>('/entry-orders');
      const orders = unwrap(res.data);
      storage.set(CACHE_KEY, JSON.stringify(orders));
      storage.set(CACHE_AT_KEY, new Date().toISOString());
      return { orders, offlineSince: null };
    } catch (err) {
      const cached = isNoAnswer(err) ? storage.getString(CACHE_KEY) : undefined;
      if (cached) {
        try {
          return { orders: JSON.parse(cached) as EntryOrderSummary[], offlineSince: storage.getString(CACHE_AT_KEY) ?? null };
        } catch {
          // A broken copy is no copy.
        }
      }
      throw err;
    }
  },

  /**
   * Receives a DTE: the head that arrived (closing it) and the caravans written, or only caravans
   * that identify head already received.
   */
  async receive(orderId: number, payload: ReceiveDtePayload): Promise<ReceiveDteResult> {
    const res = await api.post<ReceiveDteResult>(`/entry-orders/${orderId}/receive`, payload);
    return res.data;
  },
};
