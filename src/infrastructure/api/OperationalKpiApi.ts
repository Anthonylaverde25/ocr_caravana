import { MMKV } from 'react-native-mmkv';
import { api, errorMessage, isNoAnswer } from './ApiClient';

export interface KpiOrderItem {
  id: number;
  code: string;
  status: string;
  status_label: string;
  planned_heads: number;
  date: string;
  provider_name?: string | null;
  batch_name?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  source_batch_name?: string | null;
  weaning_type?: string | null;
}

export interface KpiCategoryData {
  key: string;
  template_code: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  total_pending: number;
  total_planned_heads: number;
  breakdown: Record<string, number>;
  items: KpiOrderItem[];
}

export interface OperationalKpis {
  summary: {
    total_pending_documents: number;
    last_updated_at: string;
  };
  categories: {
    entry_orders: KpiCategoryData;
    birth_orders: KpiCategoryData;
    transfer_orders: KpiCategoryData;
    weaning_orders: KpiCategoryData;
  };
}

const storage = new MMKV({
  id: 'kpi-storage',
});

const CACHE_KEY = 'operational_kpis_cached';

export const OperationalKpiApi = {
  /**
   * Obtiene los KPIs operativos desde el backend Laravel o desde la caché local si está offline.
   */
  async getOperationalKpis(): Promise<{ data: OperationalKpis; fromCache: boolean; error?: string }> {
    try {
      const response = await api.get<OperationalKpis>('/dashboard/operational-kpis');
      const data = response.data;
      
      // Guardar en caché persistente offline
      storage.set(CACHE_KEY, JSON.stringify(data));
      
      return { data, fromCache: false };
    } catch (err) {
      const msg = errorMessage(err);
      const cached = storage.getString(CACHE_KEY);

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as OperationalKpis;
          return { data: parsed, fromCache: true, error: isNoAnswer(err) ? 'Modo Offline (Caché)' : msg };
        } catch {
          // Ignorar fallo de parseo
        }
      }

      // Si no hay red ni caché previo, devolver estructura vacía
      return {
        data: {
          summary: {
            total_pending_documents: 0,
            last_updated_at: new Date().toISOString(),
          },
          categories: {
            entry_orders: {
              key: 'entry_orders',
              template_code: 'ING-02',
              title: 'Entradas de Hacienda',
              subtitle: 'Compras e ingresos a campo',
              icon: 'truck',
              color: '#059669',
              total_pending: 0,
              total_planned_heads: 0,
              breakdown: {},
              items: [],
            },
            birth_orders: {
              key: 'birth_orders',
              template_code: 'PAR-01',
              title: 'Parición y Nacimientos',
              subtitle: 'Temporada y registro de partos',
              icon: 'baby-carriage',
              color: '#D97706',
              total_pending: 0,
              total_planned_heads: 0,
              breakdown: {},
              items: [],
            },
            transfer_orders: {
              key: 'transfer_orders',
              template_code: 'CACT-01',
              title: 'Cambio de Destino / Traslado',
              subtitle: 'Movimientos entre lotes y potreros',
              icon: 'swap-horizontal',
              color: '#2563EB',
              total_pending: 0,
              total_planned_heads: 0,
              breakdown: {},
              items: [],
            },
            weaning_orders: {
              key: 'weaning_orders',
              template_code: 'DEST-01',
              title: 'Destetes Planificados',
              subtitle: 'Separación y pesada de terneros',
              icon: 'cow',
              color: '#7C3AED',
              total_pending: 0,
              total_planned_heads: 0,
              breakdown: {},
              items: [],
            },
          },
        },
        fromCache: false,
        error: msg,
      };
    }
  },
};
