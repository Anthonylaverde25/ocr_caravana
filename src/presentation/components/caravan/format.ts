/** "2026-08-14" or "2026-08-14 10:00:00" → "14/08/2026". */
export function formatDay(value: string | null): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

export function formatKg(value: number | null): string | null {
  return value === null ? null : `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`;
}

/** "+24 kg" / "-7,5 kg". */
export function formatChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`;
}

export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
