import {
  gainSinceEntry,
  gestationProgress,
  gestationStageLabel,
  movementLabel,
  normalizeCaravan,
  sexLabel,
  weightHistory,
} from '../caravans/AnimalRecord';

describe('AnimalRecord', () => {
  it('orders weighings newest first with the change from the one before', () => {
    const history = weightHistory([
      { weight: 377, date: '2026-02-02' },
      { weight: 432, date: '2026-08-14' },
      { weight: 408, date: '2026-05-10' },
    ]);
    expect(history).toEqual([
      { weight: 432, date: '2026-08-14', change: 24 },
      { weight: 408, date: '2026-05-10', change: 31 },
      { weight: 377, date: '2026-02-02', change: null },
    ]);
  });

  it('reports a weight loss as a negative change', () => {
    expect(weightHistory([{ weight: 410, date: '2026-01-01' }, { weight: 402.5, date: '2026-03-01' }])[0].change).toBe(-7.5);
  });

  it('computes the gain since entry only when both weights are known', () => {
    expect(gainSinceEntry({ currentWeight: 432, entryWeight: 318 })).toBe(114);
    expect(gainSinceEntry({ currentWeight: null, entryWeight: 318 })).toBeNull();
    expect(gainSinceEntry({ currentWeight: 432, entryWeight: null })).toBeNull();
  });

  it('turns gestation months into a bounded progress', () => {
    expect(gestationProgress(4.5)).toBe(0.5);
    expect(gestationProgress(11)).toBe(1);
    expect(gestationProgress(-1)).toBe(0);
    expect(gestationProgress(null)).toBe(0);
  });

  it('names stages, sexes and movements in Spanish', () => {
    expect(gestationStageLabel('body')).toBe('Cuerpo');
    expect(gestationStageLabel(null)).toBeNull();
    expect(sexLabel('H')).toBe('Hembra');
    expect(sexLabel(null)).toBeNull();
    expect(movementLabel('TRANSFER')).toBe('Cambio de lote');
    expect(movementLabel('NEW_KIND_OF_EVENT')).toBe('New kind of event');
  });

  it('accepts an EID typed in groups', () => {
    expect(normalizeCaravan('032 0000 0009 8412')).toBe('032000000098412');
    expect(normalizeCaravan('032-0000-0009-8412')).toBe('032000000098412');
  });

  it('accepts alphanumeric visual caravans, uppercased and without spaces', () => {
    expect(normalizeCaravan('ab 1234')).toBe('AB1234');
    expect(normalizeCaravan('ar-0457-x')).toBe('AR-0457-X');
    expect(normalizeCaravan('Ñ12/3')).toBe('Ñ12/3');
    expect(normalizeCaravan('03200000009841A')).toBe('03200000009841A');
    // Fewer than 15 digits is a visual number, not a broken EID.
    expect(normalizeCaravan('1234')).toBe('1234');
  });

  it('rejects empty, oversized or symbol-laden input', () => {
    expect(normalizeCaravan('')).toBeNull();
    expect(normalizeCaravan('   ')).toBeNull();
    expect(normalizeCaravan('A'.repeat(65))).toBeNull();
    expect(normalizeCaravan('AB#12')).toBeNull();
    expect(normalizeCaravan('-AB12')).toBeNull();
  });
});
