import { ReaderProfile } from './ReaderProfile';

export type ParseResult =
  | { ok: true; eid: string; warning?: string }
  | { ok: false; reason: string; raw: string };

/** ISO 3166 numeric for Argentina, and the ISO 11784 range reserved for manufacturer codes. */
const ARGENTINA = 32;
const MANUFACTURER_MIN = 900;
const MANUFACTURER_MAX = 998;

export class TagParser {
  private readonly pattern: RegExp;

  constructor(profile: ReaderProfile) {
    this.pattern = new RegExp(profile.linePattern);
  }

  parse(line: string): ParseResult {
    const raw = line;
    const match = this.pattern.exec(line.trim());

    if (!match?.groups) {
      return { ok: false, reason: 'La línea no tiene el formato del lector', raw };
    }

    const country = match.groups.country ?? '';
    const national = match.groups.national ?? '';
    const eid = `${country}${national}`;

    if (!/^\d{15}$/.test(eid)) {
      return { ok: false, reason: 'La caravana no tiene 15 dígitos', raw };
    }

    const code = Number(country);
    if (code !== ARGENTINA && (code < MANUFACTURER_MIN || code > MANUFACTURER_MAX)) {
      return { ok: true, eid, warning: `Código de país inesperado: ${country}` };
    }

    return { ok: true, eid };
  }
}
