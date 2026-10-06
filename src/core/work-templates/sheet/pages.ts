/**
 * The pages of one scanned document, reviewed and sent together so the all-or-nothing rule covers
 * every page. Invariant: pure TypeScript.
 */

import { cell, toNumberOrNull } from './sheetText';
import type { IdentifyResponse, SheetModule, SheetPage, SheetRow, SheetValues } from './types';

let sequence = 0;

/** A page of a sheet from the answer of `identify`. */
export function pageFromIdentify(module: SheetModule, response: IdentifyResponse, fileName: string): SheetPage {
  const context = response.context ?? {};
  const mapped = response.data?.[0]?.mapped_rows ?? [];
  sequence += 1;
  const key = `${module.code}-page-${sequence}`;
  const hojaNumero = toNumberOrNull(cell(context.hoja_numero));

  return {
    key,
    fileName,
    hojaNumero,
    hojaTotal: toNumberOrNull(cell(context.hoja_total)),
    header: module.readHeader(context),
    rows: mapped
      .map((cells, index): SheetRow => ({ id: `${key}-${index}`, pageKey: key, pageNumber: hojaNumero, values: module.readRow(cells ?? {}) }))
      .filter((row) => module.isWritten(row.values)),
  };
}

/** Why a page cannot join the pages already loaded, or null. */
export function pageMismatch(module: SheetModule, first: SheetPage | undefined, page: SheetPage): string | null {
  if (!first) return null;

  const a = module.documentKey(first.header).trim().toUpperCase();
  const b = module.documentKey(page.header).trim().toUpperCase();

  return a === b ? null : `Esta hoja es de ${b || '(sin código)'} y la primera de ${a || '(sin código)'}: cada documento se carga por separado.`;
}

/** Rows of every page in sheet order (page number when read, load order otherwise), then the ones added by hand. */
export function orderedRows(pages: SheetPage[], manual: SheetRow[]): SheetRow[] {
  return [
    ...pages
      .map((page, loadIndex) => ({ page, loadIndex }))
      .sort((a, b) => (a.page.hojaNumero ?? 1000 + a.loadIndex) - (b.page.hojaNumero ?? 1000 + b.loadIndex))
      .flatMap(({ page }) => page.rows),
    ...manual,
  ];
}

/** "Hoja N" numbers the read pages announce ("de M") but were not loaded. */
export function missingPages(pages: SheetPage[]): number[] {
  const total = Math.max(0, ...pages.map((p) => p.hojaTotal ?? 0));
  const present = new Set(pages.map((p) => p.hojaNumero).filter((n): n is number => n !== null));

  return Array.from({ length: total }, (_, i) => i + 1).filter((n) => !present.has(n));
}

/** The header the review starts from: the first page's, completed with what later pages wrote. */
export function mergedHeader(pages: SheetPage[]): SheetValues {
  return pages.reduce<SheetValues>((acc, page) => {
    Object.entries(page.header).forEach(([key, value]) => {
      if (!acc[key] && value) acc[key] = value;
    });

    return acc;
  }, {});
}

export function emptyRow(module: SheetModule, id: string): SheetRow {
  return { id, pageKey: 'manual', pageNumber: null, values: Object.fromEntries(module.rowFields.map((f) => [f.key, ''])) };
}
