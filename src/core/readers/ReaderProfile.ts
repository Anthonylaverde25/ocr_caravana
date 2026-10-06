/**
 * A reader profile describes how one model of chute reader speaks over BLE: where it
 * transmits (service and characteristic UUIDs) and how it writes a tag. The same JSON
 * files drive the Mac simulator (tools/reader-simulator), so both sides cannot disagree.
 */
export interface ReaderProfile {
  code: string;
  displayName: string;
  /** UUIDs and layout invented to imitate a brand, not taken from the vendor. */
  simulated: boolean;
  advertisedName: string;
  serviceUuid: string;
  notifyCharacteristicUuid: string;
  writeCharacteristicUuid?: string;
  lineTerminator: string;
  chunkSize: number;
  /** Placeholders: {eid}, {country}, {national}, {datetime}. */
  lineTemplate: string;
  /** Must expose the named groups `country` and `national`. */
  linePattern: string;
}

export class InvalidReaderProfileError extends Error {}

export function validateProfile(raw: unknown): ReaderProfile {
  const p = raw as Partial<ReaderProfile>;
  const required: (keyof ReaderProfile)[] = [
    'code', 'displayName', 'advertisedName', 'serviceUuid', 'notifyCharacteristicUuid',
    'lineTerminator', 'chunkSize', 'lineTemplate', 'linePattern',
  ];
  for (const key of required) {
    if (p[key] === undefined || p[key] === '') {
      throw new InvalidReaderProfileError(`Perfil '${p.code ?? '?'}': falta ${key}`);
    }
  }
  if (!p.linePattern!.includes('(?<country>') || !p.linePattern!.includes('(?<national>')) {
    throw new InvalidReaderProfileError(`Perfil '${p.code}': linePattern sin grupos country/national`);
  }
  return { simulated: false, ...p } as ReaderProfile;
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Writes a tag the way the reader would, without the terminator. Mirrors the simulator. */
export function formatLine(profile: ReaderProfile, eid: string, now: Date = new Date()): string {
  return profile.lineTemplate
    .replace('{datetime}', formatDateTime(now))
    .replace('{country}', eid.slice(0, 3))
    .replace('{national}', eid.slice(3))
    .replace('{eid}', eid);
}
