/**
 * How handwritten cells read by the AI are cleaned before review: the same normalisations the web
 * applies. Nothing is guessed: an unreadable value stays empty.
 * Invariant: pure TypeScript.
 */

import type { IdentifyCell } from './types';

export const text = (raw: unknown): string => String(raw ?? '').trim();

/** The value of a cell, whether it came as `{ value }` or bare. */
export const cell = (raw: IdentifyCell | unknown): string =>
  text(raw !== null && typeof raw === 'object' && 'value' in (raw as object) ? (raw as IdentifyCell).value : raw);

export const toNumberOrNull = (raw: unknown): number | null => {
  const value = Number(text(raw));

  return text(raw) !== '' && Number.isFinite(value) ? value : null;
};

/** DD/MM/YYYY as written, or ISO, to ISO; anything unreadable stays empty. */
export const normalizeSheetDate = (raw: unknown): string => {
  const clean = text(raw).replace(/\s*([/\-.])\s*/g, '$1');
  const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);

  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;

  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);

  if (dmy) return `${dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  return '';
};

/** Handwritten weights may come with a comma decimal separator or a trailing unit. */
export const cleanNumber = (raw: unknown): string => text(raw).replace(/kg/i, '').replace(',', '.').trim();

/** What the scan returns for a crossed box — the same list the backend accepts. */
const CROSSED = ['X', '✓', '✔', 'SI', 'SÍ', 'TRUE', '1'];

export const crossed = (raw: unknown): string => (CROSSED.includes(text(raw).toUpperCase()) ? 'X' : '');

/** "" → null, "180.5" → 180.5; a value that is not a number goes as it is, for the server to reject. */
export const numberOrText = (raw: string): number | string | null => {
  const value = raw.trim();

  if (value === '') return null;

  const n = Number(value.replace(',', '.'));

  return Number.isFinite(n) ? n : value;
};

export const orNull = (raw: string | undefined): string | null => (raw && raw.trim() !== '' ? raw.trim() : null);
