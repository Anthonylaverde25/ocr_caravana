import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AnimalRecord, MovementEntry, WeightEntry } from '../../core/caravans/AnimalRecord';
import { errorMessage } from '../../infrastructure/api/ApiClient';
import { CaravanRecordApi, RecordLookup } from '../../infrastructure/api/CaravanRecordApi';
import { StatusTone } from '../components/ui/StatusPill';
import { useReader } from '../reader/ReaderContext';

export type LookupState =
  | { phase: 'idle' }
  | { phase: 'loading'; eid: string }
  | { phase: 'error'; eid: string; message: string }
  | { phase: 'found'; record: AnimalRecord; weights: WeightEntry[]; movements: MovementEntry[] }
  | { phase: 'not_found'; identification: string }
  | { phase: 'other_company'; identification: string };

export interface RecentLookup {
  eid: string;
  summary: string;
  label: string;
  tone: StatusTone;
  at: Date;
}

const MAX_RECENT = 10;

/**
 * Looks caravans up as they are read or typed. While the screen is focused it claims the wand,
 * so a read opens the animal's record (even over the one on screen) instead of joining the
 * registration session.
 */
export function useCaravanLookup() {
  const { claimReadings } = useReader();
  const [state, setState] = useState<LookupState>({ phase: 'idle' });
  const [recent, setRecent] = useState<RecentLookup[]>([]);
  // Only the latest request may land: an earlier, slower answer must not overwrite it.
  const requestId = useRef(0);

  const lookup = useCallback(async (eid: string) => {
    const id = ++requestId.current;
    setState({ phase: 'loading', eid });
    try {
      const result = await CaravanRecordApi.find(eid);
      if (id !== requestId.current) return;
      setState(toState(result));
      setRecent((list) => [toRecent(result), ...list.filter((r) => r.eid !== eid)].slice(0, MAX_RECENT));
    } catch (error) {
      if (id !== requestId.current) return;
      setState({ phase: 'error', eid, message: errorMessage(error) });
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    setState({ phase: 'idle' });
  }, []);

  useFocusEffect(useCallback(() => claimReadings((eid) => void lookup(eid)), [claimReadings, lookup]));

  return { state, recent, lookup, reset, clearRecent: () => setRecent([]) };
}

function toState(result: RecordLookup): LookupState {
  switch (result.kind) {
    case 'found':
      return { phase: 'found', record: result.record, weights: result.weights, movements: result.movements };
    case 'not_found':
      return { phase: 'not_found', identification: result.identification };
    case 'other_company':
      return { phase: 'other_company', identification: result.identification };
  }
}

function toRecent(result: RecordLookup): RecentLookup {
  const at = new Date();
  if (result.kind === 'not_found') {
    return { eid: result.identification, summary: 'Sin registrar', label: 'No encontrada', tone: 'warning', at };
  }
  if (result.kind === 'other_company') {
    return { eid: result.identification, summary: 'Registrada en otra empresa', label: 'Otra empresa', tone: 'danger', at };
  }
  const { record } = result;
  const summary = [record.categoryName, record.batchName].filter(Boolean).join(' · ') || 'Sin categoría';
  const label = record.physiological?.isPregnant ? 'Preñada' : record.batchName ? 'En lote' : 'Registrada';
  return { eid: record.identification, summary, label, tone: 'success', at };
}
