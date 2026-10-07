import { useMemo, useState } from 'react';
import {
  ReceptionCaravan,
  Sex,
  errorsByTag,
  localDateString,
  missingOf,
  parseTags,
  toReceivedAnimal,
  withBreed,
  withSex,
} from '../../../core/entry-orders/reception';
import { newCaravanWithDefaults } from '../../../core/entry-orders/troopDefaults';
import { errorMessage } from '../../../infrastructure/api/ApiClient';
import { EntryOrderApi, EntryOrderDteSummary, EntryOrderSummary, receptionErrorsOf, troopOf } from '../../../infrastructure/api/EntryOrderApi';

export type CaravanReceptionMode = 'receive' | 'identify';

/**
 * The reception of a DTE with its caravans, or — on a DTE already received by count — the caravans
 * that identify its head. Coordinates physical arrived head counting with individual ear-tag
 * registration, allowing partial ear-tagging while closing or identifying the DTE.
 */
export function useCaravanReception(order: EntryOrderSummary, dte: EntryOrderDteSummary, mode: CaravanReceptionMode) {
  const troop = useMemo(() => troopOf(order), [order]);
  const [receivedAt, setReceivedAt] = useState(localDateString());
  const [receivedHeads, setReceivedHeadsState] = useState(mode === 'receive' ? String(dte.pending_count) : '');
  const [caravans, setCaravans] = useState<ReceptionCaravan[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [showMissing, setShowMissing] = useState(false);

  /** Head the count/caravans are reconciled against: in transit, or received without caravan. */
  const expected = mode === 'identify' ? dte.uncaravaned_count : dte.pending_count;

  const parsedReceived =
    mode === 'receive'
      ? receivedHeads.trim() !== '' && !isNaN(Number(receivedHeads))
        ? parseInt(receivedHeads, 10)
        : null
      : null;

  const missingHeads = mode === 'receive' && parsedReceived !== null ? Math.max(0, expected - parsedReceived) : 0;
  const withoutCaravans =
    mode === 'receive' && parsedReceived !== null
      ? Math.max(0, parsedReceived - caravans.length)
      : mode === 'identify'
      ? Math.max(0, expected - caravans.length)
      : 0;

  const incomplete = caravans.filter((c) => missingOf(troop, c).length > 0).length;

  const setReceivedHeads = (val: string) => {
    setReceivedHeadsState(val);
    setError(null);
  };

  /** Adds the tags of a typed or pasted list; returns how many were new. */
  const addTags = (text: string): number => {
    const fresh = parseTags(text, caravans.map((c) => c.tag));

    if (fresh.length > 0) {
      setCaravans((current) => [...current, ...fresh.map((tag) => newCaravanWithDefaults(tag, troop))]);
      setError(null);
    }

    return fresh.length;
  };

  const update = (tag: string, change: (caravan: ReceptionCaravan) => ReceptionCaravan) => {
    setCaravans((current) => current.map((c) => (c.tag === tag ? change(c) : c)));
    setServerErrors((current) => {
      const next = { ...current };
      delete next[tag];
      return next;
    });
  };

  const actions = {
    setSex: (tag: string, sex: Sex | null) => update(tag, (c) => withSex(troop, c, sex)),
    setCategory: (tag: string, position: number | null) => update(tag, (c) => ({ ...c, categoryPosition: position })),
    setBreed: (tag: string, name: string | null) => update(tag, (c) => withBreed(troop, c, name)),
    setCoat: (tag: string, position: number | null) => update(tag, (c) => ({ ...c, breedPosition: position })),
    remove: (tag: string) => setCaravans((current) => current.filter((c) => c.tag !== tag)),
    clear: () => setCaravans([]),
  };

  /** Checked on press, not by a disabled button: what is missing is said, caravan by caravan. */
  const validate = (): string | null => {
    if (mode === 'receive') {
      if (parsedReceived === null || parsedReceived < 0) {
        return 'Indicá cuántas cabezas llegaron.';
      }
      if (caravans.length === 0) {
        return 'Cargá al menos una caravana, o usá "Conteo" para confirmar sólo las cabezas.';
      }
      if (caravans.length > parsedReceived) {
        return `Hay ${caravans.length} caravanas para ${parsedReceived} cabezas: no puede haber más caravanas que cabezas.`;
      }
      if (missingHeads > 0 && !reason.trim()) {
        return 'Indicá el motivo del faltante para registrar la novedad.';
      }
    } else {
      if (caravans.length === 0) {
        return 'Cargá al menos una caravana para identificar.';
      }
      if (caravans.length > expected) {
        return `Hay ${expected} cabezas sin caravana: cargaste ${caravans.length}.`;
      }
    }

    if (incomplete > 0) {
      return `Faltan datos en ${incomplete === 1 ? '1 caravana' : `${incomplete} caravanas`}: completá lo marcado.`;
    }

    return null;
  };

  const submit = async (): Promise<boolean> => {
    const problem = validate();

    setShowMissing(true);
    setError(problem);

    if (problem) return false;

    setLoading(true);
    setServerErrors({});

    try {
      await EntryOrderApi.receive(order.id, {
        method: 'MANUAL',
        received_at: receivedAt,
        dte_id: dte.id,
        received_head_count: mode === 'receive' ? parsedReceived : null,
        reason: mode === 'receive' && missingHeads > 0 ? reason.trim() : null,
        animals: caravans.map((c) => toReceivedAnimal(troop, c)),
      });

      return true;
    } catch (err) {
      const { message, rows } = receptionErrorsOf(err);

      setServerErrors(errorsByTag(caravans.map((c) => c.tag), rows));
      setError(message ?? errorMessage(err));

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    troop,
    receivedAt,
    setReceivedAt,
    receivedHeads,
    setReceivedHeads,
    parsedReceived,
    withoutCaravans,
    caravans,
    reason,
    setReason,
    expected,
    missingHeads,
    incomplete,
    loading,
    error,
    serverErrors,
    showMissing,
    addTags,
    actions,
    submit,
  };
}

export type CaravanReception = ReturnType<typeof useCaravanReception>;
