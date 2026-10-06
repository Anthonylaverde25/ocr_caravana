import { par01Module } from '../par01/par01Module';
import { PAR01_PRESETS } from '../par01/par01Presets';
import { mergedHeader, missingPages, orderedRows, pageFromIdentify, pageMismatch } from '../sheet/pages';
import type { IdentifyResponse } from '../sheet/types';

const page = (response: IdentifyResponse, name = 'hoja.png') => pageFromIdentify(par01Module, response, name);

const sheet = (header: Record<string, unknown>, rows: Record<string, unknown>[]): IdentifyResponse => ({
  identified_template: { code: 'PAR-01' },
  context: Object.fromEntries(Object.entries(header).map(([k, v]) => [k, { value: v }])),
  data: [{ mapped_rows: rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, { value: v }]))) }],
});

describe('PAR-01 module', () => {
  it('reads a page as the web does: dates to ISO, tags upper case, weights cleaned, crossed boxes', () => {
    const p = page(
      sheet({ orden_paricion: 'pa-20260929-0001', fecha_recorrida: '28 / 09 / 2026', hoja_numero: '1', hoja_total: '2' }, [
        { caravana_madre: 'par-v-01', resultado: 'v', caravana_cria: 'par-c-01', sexo: 'm', peso: '29,5 kg', fecha_nacimiento: '21/09/26', fuera_de_orden: '✓' },
        { caravana_madre: '', resultado: '', caravana_cria: '' },
      ])
    );

    expect(p.header.orden_paricion).toBe('PA-20260929-0001');
    expect(p.header.fecha_recorrida).toBe('2026-09-28');
    expect(p.hojaNumero).toBe(1);
    expect(p.rows).toHaveLength(1);
    expect(p.rows[0].values).toMatchObject({
      caravana_madre: 'PAR-V-01',
      resultado: 'V',
      caravana_cria: 'PAR-C-01',
      sexo: 'M',
      peso: '29.5',
      fecha_nacimiento: '2026-09-21',
      fuera_de_orden: 'X',
    });
  });

  it('keeps an illegible sex as read, for the server to reject', () => {
    expect(page(sheet({}, [{ caravana_madre: 'V-1', sexo: 'mh' }])).rows[0].values.sexo).toBe('MH');
  });

  it('builds the payload the web sends', () => {
    const p = page(sheet({ orden_paricion: 'PA-1', fecha_recorrida: '28/09/2026' }, [{ caravana_madre: 'V-1', resultado: 'NM', peso: '' }]));
    const payload = par01Module.toPayload(p.header, p.rows) as { rows: Record<string, unknown>[] } & Record<string, unknown>;

    expect(payload).toMatchObject({ birth_order_id: null, orden_paricion: 'PA-1', fecha_recorrida: '2026-09-28', lote: null });
    expect(payload.rows[0]).toEqual({
      caravana_madre: 'V-1',
      resultado: 'NM',
      caravana_cria: null,
      sexo: null,
      peso: null,
      raza: null,
      pelaje: null,
      dientes: 0,
      father_id: null,
      fecha_nacimiento: null,
      observations: null,
      fuera_de_orden: false,
    });
  });

  it('looks the order up by the code on the paper and sends its id', () => {
    const lookup = par01Module.lookup!;

    expect(lookup.path({ orden_paricion: 'PA-20260929-0001' })).toBe('/birth-orders/by-code/PA-20260929-0001');
    expect(lookup.path({ orden_paricion: '  ' })).toBeNull();
    expect(lookup.apply({ birth_order_id: null, rows: [] }, { id: 5, code: 'PA-20260929-0001' })).toEqual({ birth_order_id: 5, rows: [] });
    // Not found: the code goes as it is and the server says the order does not exist.
    expect(lookup.apply({ birth_order_id: null, orden_paricion: 'PA-X' }, null)).toEqual({ birth_order_id: null, orden_paricion: 'PA-X' });
  });

  it('refuses a page of another order and orders pages by their number', () => {
    const second = page(sheet({ orden_paricion: 'PA-1', hoja_numero: '2', hoja_total: '2' }, [{ caravana_madre: 'V-2' }]));
    const first = page(sheet({ orden_paricion: 'PA-1', hoja_numero: '1', hoja_total: '2', fecha_recorrida: '01/10/2026' }, [{ caravana_madre: 'V-1' }]));
    const other = page(sheet({ orden_paricion: 'PA-9' }, [{ caravana_madre: 'V-9' }]));

    expect(pageMismatch(par01Module, second, first)).toBeNull();
    expect(pageMismatch(par01Module, second, other)).toContain('PA-9');
    expect(orderedRows([second, first], []).map((r) => r.values.caravana_madre)).toEqual(['V-1', 'V-2']);
    expect(missingPages([second])).toEqual([1]);
    expect(mergedHeader([second, first]).fecha_recorrida).toBe('2026-10-01');
  });

  it('turns every preset into a reviewable sheet', () => {
    expect(PAR01_PRESETS.map((p) => p.scenario)).toEqual(['HAPPY_PATH', 'WARNING_FLOW', 'REPAIR_FLOW']);
    PAR01_PRESETS.forEach((preset) => {
      const p = page(preset.response, preset.fileName);
      expect(p.header.fecha_recorrida).toBe('2026-09-28');
      expect(p.rows.length).toBeGreaterThan(0);
    });
  });

  it('summarizes a registered round', () => {
    expect(par01Module.summarize({ live_count: 3, stillborn_count: 1, perinatal_death_count: 0, already_registered_count: 2 })).toEqual([
      '3 parto(s) con cría viva',
      '1 nacido(s) muerto(s)',
      '2 ya registrada(s), se saltean',
    ]);
  });
});
