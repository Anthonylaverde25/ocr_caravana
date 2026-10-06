import { errorCount, feedbackFromResponse } from '../sheet/feedback';

describe('feedbackFromResponse', () => {
  it('reads row errors grouped by row (PAR-01, DEST-01, CACT-01)', () => {
    const f = feedbackFromResponse(422, {
      status: 'invalid',
      message: 'La planilla tiene errores.',
      header_errors: [{ field: 'fecha_recorrida', code: 'DATE_MISSING', message: 'Falta la fecha.' }],
      row_errors: [{ row_index: 2, caravana_madre: 'V-1', errors: [{ code: 'OUTCOME_UNKNOWN', message: 'No se entiende.', field: 'resultado' }] }],
    });

    expect(f.ok).toBe(false);
    expect(f.headerErrors).toEqual([{ field: 'fecha_recorrida', code: 'DATE_MISSING', message: 'Falta la fecha.' }]);
    expect(f.rowErrors[2]).toEqual([{ code: 'OUTCOME_UNKNOWN', message: 'No se entiende.', field: 'resultado' }]);
    expect(errorCount(f)).toBe(2);
  });

  it('reads flat row errors (entry orders)', () => {
    const f = feedbackFromResponse(422, {
      header_errors: [],
      row_errors: [
        { row: 0, field: 'caravana', code: 'CARAVAN_EXISTS', message: 'Ya existe.' },
        { row: 0, field: 'sex', code: 'SEX_MISSING', message: 'Falta el sexo.' },
      ],
    });

    expect(f.rowErrors[0].map((e) => e.code)).toEqual(['CARAVAN_EXISTS', 'SEX_MISSING']);
  });

  it('keeps warnings of a success apart, by row or for the sheet', () => {
    const f = feedbackFromResponse(201, {
      status: 'success',
      data: { live_count: 2, warnings: [{ code: 'MOTHER_MOVED', message: 'Se movió.', row_index: 1 }, { code: 'X', message: 'General.' }] },
    });

    expect(f.ok).toBe(true);
    expect(f.rowWarnings[1][0].code).toBe('MOTHER_MOVED');
    expect(f.headerWarnings.map((w) => w.code)).toEqual(['X']);
    expect(f.data.live_count).toBe(2);
  });

  it('reads top-level warnings with `row` (entry orders)', () => {
    const f = feedbackFromResponse(200, { order: { status: 'COMPLETED' }, warnings: [{ code: 'BREED_UNDECLARED', message: 'Sin raza.', row: 3 }] });

    expect(f.rowWarnings[3][0].code).toBe('BREED_UNDECLARED');
  });

  it('turns Laravel validation errors into header or row errors', () => {
    const f = feedbackFromResponse(422, { message: 'Invalid', errors: { fecha_destete: ['Falta la fecha.'], 'rows.4.peso': ['No es un número.'] } });

    expect(f.headerErrors).toEqual([{ code: 'INVALID', message: 'Falta la fecha.', field: 'fecha_destete' }]);
    expect(f.rowErrors[4]).toEqual([{ code: 'INVALID', message: 'No es un número.', field: 'peso' }]);
  });

  it('shows the message of a plain 422 as a header error', () => {
    const f = feedbackFromResponse(422, { message: 'No existe la orden.', code: 'BIRTH_ORDER_NOT_FOUND' });

    expect(f.headerErrors).toEqual([{ code: 'BIRTH_ORDER_NOT_FOUND', message: 'No existe la orden.' }]);
  });
});
