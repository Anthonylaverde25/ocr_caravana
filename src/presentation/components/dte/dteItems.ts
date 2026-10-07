import { EntryOrderDteSummary, EntryOrderSummary } from '../../../infrastructure/api/EntryOrderApi';

export type DteFilterStatus = 'ALL' | 'IN_TRANSIT' | 'AWAITING_DTE' | 'RECEIVED' | 'COMPLETED';

export const DTE_FILTERS: { value: DteFilterStatus; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'IN_TRANSIT', label: 'En tránsito' },
  { value: 'AWAITING_DTE', label: 'Espera DTe' },
  { value: 'RECEIVED', label: 'Por identificar' },
  { value: 'COMPLETED', label: 'Completados' },
];

export interface DteDisplayItem {
  id: number;
  order_id: number;
  code: string;
  dte_number?: string;
  dte_date?: string;
  status: string;
  status_label: string;
  planned_heads: number;
  heads_received: number;
  pending_heads: number;
  date: string;
  provider_name?: string | null;
  batch_name?: string | null;
  origin_renspa?: string | null;
  accepts_reception: boolean;
  rawDte?: EntryOrderDteSummary;
  hasDte: boolean;
  /** Head of the DTE received by count, their caravans still to write. */
  uncaravaned: number;
  order: EntryOrderSummary;
}

/** The order's status, as the system says it: the phone does not work out its own. */
export const CLOSED_STATUSES = ['COMPLETED', 'CLOSED_INCOMPLETE'];

/** One card per DTE; an order without a DTE yet still gets one, so it is not lost from sight. */
export function toDisplayItems(orders: EntryOrderSummary[]): DteDisplayItem[] {
  return orders.flatMap((order): DteDisplayItem[] => {
    if (order.dtes && order.dtes.length > 0) {
      return order.dtes.map((dte) => ({
        id: dte.id,
        order_id: order.id,
        code: order.code,
        dte_number: dte.dte_number,
        dte_date: dte.dte_date,
        status: order.status,
        status_label: order.status === 'RECEIVED' ? `Recibida · ${order.uncaravaned_count ?? 0} por identificar` : order.status_label,
        planned_heads: dte.head_count,
        heads_received: dte.received_count,
        pending_heads: dte.pending_count,
        date: dte.dte_date || order.created_at?.slice(0, 10) || '',
        provider_name: order.provider?.name,
        batch_name: order.batch_name,
        origin_renspa: order.farm?.renspa,
        accepts_reception: Boolean(order.accepts_reception && dte.pending_count > 0),
        rawDte: dte,
        hasDte: true,
        uncaravaned: dte.uncaravaned_count ?? 0,
        order,
      }));
    }

    return [
      {
        id: order.id * 10000,
        order_id: order.id,
        code: order.code,
        dte_number: undefined,
        dte_date: undefined,
        status: order.status,
        status_label: order.status_label || (order.status === 'AWAITING_DTE' ? 'En espera de DTE' : 'Borrador'),
        planned_heads: order.head_count,
        heads_received: order.received_count || 0,
        pending_heads: Math.max(0, order.head_count - (order.received_count || 0)),
        date: order.created_at?.slice(0, 10) || '',
        provider_name: order.provider?.name,
        batch_name: order.batch_name,
        origin_renspa: order.farm?.renspa,
        accepts_reception: false,
        rawDte: undefined,
        hasDte: false,
        uncaravaned: 0,
        order,
      },
    ];
  });
}

export function matchesDteFilter(item: DteDisplayItem, query: string, filter: DteFilterStatus): boolean {
  const q = query.toLowerCase();
  const matchesSearch =
    item.code.toLowerCase().includes(q) ||
    Boolean(item.dte_number?.toLowerCase().includes(q)) ||
    Boolean(item.provider_name?.toLowerCase().includes(q)) ||
    Boolean(item.batch_name?.toLowerCase().includes(q));

  const matchesStatus =
    filter === 'ALL' ||
    (filter === 'IN_TRANSIT' && item.hasDte && item.pending_heads > 0) ||
    (filter === 'AWAITING_DTE' && (item.status === 'AWAITING_DTE' || !item.hasDte)) ||
    (filter === 'RECEIVED' && item.uncaravaned > 0) ||
    (filter === 'COMPLETED' && CLOSED_STATUSES.includes(item.status));

  return matchesSearch && matchesStatus;
}
