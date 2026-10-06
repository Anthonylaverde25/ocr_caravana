/**
 * PAR-01, the calving round sheet: one row per female of the birth order, what the round found
 * (V parió, NM nació muerto, M murió al pie, N no parió) and the calf. Registered against its order
 * by `POST /work-templates/par-01/process`, which decides every rule; the app sends what the paper
 * says, as the web does. Invariant: pure TypeScript.
 */

import { cell, cleanNumber, crossed, normalizeSheetDate, numberOrText, orNull, text } from '../sheet/sheetText';
import type { SheetModule } from '../sheet/types';

const SEX_OPTIONS = [
  { value: 'M', label: 'Macho' },
  { value: 'H', label: 'Hembra' },
];

const count = (data: Record<string, unknown>, key: string): number => Number(data[key] ?? 0);

export const par01Module: SheetModule = {
  code: 'PAR-01',
  title: 'Planilla de Parición',
  endpoint: '/work-templates/par-01/process',
  multiPage: true,
  rowTitleKey: 'caravana_madre',
  headerFields: [
    { key: 'orden_paricion', label: 'Orden de parición', upper: true, placeholder: 'PA-AAAAMMDD-NNNN' },
    { key: 'fecha_recorrida', label: 'Fecha de recorrida', kind: 'date' },
    { key: 'lote', label: 'Lote' },
    { key: 'responsable', label: 'Responsable' },
    { key: 'observaciones', label: 'Observaciones' },
  ],
  rowFields: [
    { key: 'caravana_madre', label: 'Caravana madre', upper: true },
    { key: 'resultado', label: 'Resultado (V, NM, M, N)', upper: true },
    { key: 'caravana_cria', label: 'Caravana cría', upper: true },
    { key: 'sexo', label: 'Sexo cría', kind: 'choice', options: SEX_OPTIONS },
    { key: 'peso', label: 'Peso cría (kg)', kind: 'number' },
    { key: 'raza', label: 'Raza' },
    { key: 'pelaje', label: 'Pelaje' },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', kind: 'date' },
    {
      key: 'fuera_de_orden',
      label: 'Fuera de orden',
      kind: 'choice',
      options: [
        { value: 'X', label: 'Sí' },
        { value: '', label: 'No' },
      ],
    },
    { key: 'observations', label: 'Observaciones' },
  ],
  documentKey: (header) => header.orden_paricion ?? '',
  readHeader: (context) => ({
    orden_paricion: cell(context.orden_paricion).toUpperCase(),
    fecha_recorrida: normalizeSheetDate(cell(context.fecha_recorrida)),
    lote: cell(context.lote),
    responsable: cell(context.responsable),
    observaciones: cell(context.observaciones),
  }),
  readRow: (cells) => ({
    caravana_madre: cell(cells.caravana_madre).toUpperCase(),
    resultado: cell(cells.resultado).toUpperCase(),
    caravana_cria: cell(cells.caravana_cria).toUpperCase(),
    // As read: an illegible "MH" must reach the review as it is, never cut to its first letter.
    sexo: cell(cells.sexo).toUpperCase(),
    peso: cleanNumber(cell(cells.peso)),
    raza: cell(cells.raza),
    pelaje: cell(cells.pelaje),
    fecha_nacimiento: normalizeSheetDate(cell(cells.fecha_nacimiento)),
    fuera_de_orden: crossed(cell(cells.fuera_de_orden)),
    observations: cell(cells.observations),
  }),
  // A printed line nobody wrote on still names its female: it stays, as pending.
  isWritten: (v) => text(v.caravana_madre) !== '' || text(v.resultado) !== '' || text(v.caravana_cria) !== '',
  toPayload: (header, rows) => ({
    birth_order_id: null,
    orden_paricion: orNull(header.orden_paricion),
    fecha_recorrida: orNull(header.fecha_recorrida),
    lote: orNull(header.lote),
    responsable: orNull(header.responsable),
    observaciones: orNull(header.observaciones),
    rows: rows.map(({ values: v }) => ({
      caravana_madre: v.caravana_madre ?? '',
      resultado: orNull(v.resultado),
      caravana_cria: orNull(v.caravana_cria),
      sexo: orNull(v.sexo),
      peso: numberOrText(v.peso ?? ''),
      raza: orNull(v.raza),
      pelaje: orNull(v.pelaje),
      dientes: 0,
      father_id: null,
      fecha_nacimiento: orNull(v.fecha_nacimiento),
      observations: orNull(v.observations),
      fuera_de_orden: (v.fuera_de_orden ?? '') !== '',
    })),
  }),
  lookup: {
    path: (header) => (header.orden_paricion?.trim() ? `/birth-orders/by-code/${encodeURIComponent(header.orden_paricion.trim())}` : null),
    apply: (payload, found) => ({ ...payload, birth_order_id: typeof found?.id === 'number' ? found.id : null }),
  },
  summarize: (data) =>
    [
      `${count(data, 'live_count')} parto(s) con cría viva`,
      count(data, 'stillborn_count') > 0 ? `${count(data, 'stillborn_count')} nacido(s) muerto(s)` : null,
      count(data, 'perinatal_death_count') > 0 ? `${count(data, 'perinatal_death_count')} muerto(s) al pie` : null,
      count(data, 'overdue_new_count') > 0 ? `${count(data, 'overdue_new_count')} con parto vencido` : null,
      count(data, 'already_registered_count') > 0 ? `${count(data, 'already_registered_count')} ya registrada(s), se saltean` : null,
      count(data, 'unplanned_count') > 0 ? `${count(data, 'unplanned_count')} fuera de la orden, agregada(s)` : null,
    ].filter((line): line is string => line !== null),
};
