import { Sex } from '../entities/RegistrationSession';

export type GestationStage = 'head' | 'body' | 'tail';

/** What the phone shows of one animal after reading its caravan. */
export interface AnimalRecord {
  id: number;
  identification: string;
  sex: Sex | null;
  categoryName: string | null;
  subcategoryName: string | null;
  breedName: string | null;
  colorName: string | null;
  teeth: number | null;
  currentWeight: number | null;
  entryWeight: number | null;
  /** As the system sends it: "MM/YYYY". */
  entryMonth: string | null;
  renspa: string | null;
  providerName: string | null;
  batchName: string | null;
  farmName: string | null;
  /** Females only. */
  physiological: { label: string; isPregnant: boolean; isNursing: boolean } | null;
  gestation: {
    stage: GestationStage | null;
    months: number | null;
    estimatedDueDate: string | null;
    sires: { identification: string; confirmed: boolean }[];
  } | null;
  lineage: { mother: string | null; father: string | null; birthDate: string | null } | null;
  stillbornCount: number;
}

export interface WeightEntry {
  weight: number;
  /** YYYY-MM-DD */
  date: string;
}

export interface MovementEntry {
  type: string;
  /** YYYY-MM-DD HH:mm:ss */
  date: string;
  observations: string | null;
}

/** A gestation is read as about nine months. */
const GESTATION_MONTHS = 9;

const STAGE_LABEL: Record<GestationStage, string> = { head: 'Cabeza', body: 'Cuerpo', tail: 'Cola' };

const MOVEMENT_LABEL: Record<string, string> = {
  TRANSFER: 'Cambio de lote',
  WEANING: 'Destete',
  ENTRY: 'Ingreso',
  PURCHASE: 'Compra',
  VETERINARY_DIAGNOSIS: 'Diagnóstico veterinario',
  LAB_SAMPLE: 'Muestra de laboratorio',
  ANDROLOGICAL_EXAM: 'Examen andrológico',
  BLOOD_SEROLOGY: 'Serología',
  PREPUCE_SCRAPE: 'Raspaje prepucial',
};

export function sexLabel(sex: Sex | null): string | null {
  if (sex === 'M') return 'Macho';
  if (sex === 'H') return 'Hembra';
  return null;
}

export function gestationStageLabel(stage: GestationStage | null): string | null {
  return stage ? STAGE_LABEL[stage] : null;
}

/** 0–1 share of the gestation already gone, for the progress bar. */
export function gestationProgress(months: number | null): number {
  if (months === null || !Number.isFinite(months)) return 0;
  return Math.min(Math.max(months / GESTATION_MONTHS, 0), 1);
}

/** An unknown type still reads as words: "SOME_NEW_TYPE" → "Some new type". */
export function movementLabel(type: string): string {
  const known = MOVEMENT_LABEL[type];
  if (known) return known;
  const words = type.toLowerCase().replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Newest first, each with how much it changed from the weighing before it. */
export function weightHistory(weights: WeightEntry[]): (WeightEntry & { change: number | null })[] {
  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.map((entry, i) => {
    const previous = sorted[i + 1];
    return { ...entry, change: previous ? round1(entry.weight - previous.weight) : null };
  });
}

/** Kilos put on since the animal came in, when both weights are known. */
export function gainSinceEntry(record: Pick<AnimalRecord, 'currentWeight' | 'entryWeight'>): number | null {
  if (record.currentWeight === null || record.entryWeight === null) return null;
  return round1(record.currentWeight - record.entryWeight);
}

/** Longest identification the API accepts. */
const MAX_IDENTIFICATION = 64;

/**
 * A caravan typed by hand: an electronic EID (15 digits) or a visual tag, which may carry letters.
 * Spaces are dropped and letters uppercased, as the reception does. Dashes are kept, since they
 * can be part of a visual tag, except in an EID typed in groups ("032-0000-…").
 */
export function normalizeCaravan(input: string): string | null {
  const compact = input.replace(/\s+/g, '').toUpperCase();
  if (compact === '' || compact.length > MAX_IDENTIFICATION) return null;
  const digits = compact.replace(/-/g, '');
  if (/^\d{15}$/.test(digits)) return digits;
  return /^[A-Z0-9Ñ][A-Z0-9Ñ./-]*$/.test(compact) ? compact : null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
