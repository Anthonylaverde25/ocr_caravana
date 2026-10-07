export interface ReceptionReconciliation {
  expected: number;
  receivedHeads: number;
  caravansCount: number;
  reason?: string;
}

export function reconcileReception(rec: ReceptionReconciliation) {
  const difference = rec.receivedHeads - rec.expected;
  const missingHeads = Math.max(0, rec.expected - rec.receivedHeads);
  const withoutCaravans = Math.max(0, rec.receivedHeads - rec.caravansCount);
  const isExactMatch = difference === 0;

  let validationError: string | null = null;

  if (rec.receivedHeads < 0) {
    validationError = 'Indicá cuántas cabezas llegaron.';
  } else if (rec.caravansCount === 0) {
    validationError = 'Cargá al menos una caravana, o usá "Conteo" para confirmar sólo las cabezas.';
  } else if (rec.caravansCount > rec.receivedHeads) {
    validationError = `Hay ${rec.caravansCount} caravanas para ${rec.receivedHeads} cabezas: no puede haber más caravanas que cabezas.`;
  } else if (missingHeads > 0 && (!rec.reason || !rec.reason.trim())) {
    validationError = 'Indicá el motivo del faltante para registrar la novedad.';
  }

  return {
    difference,
    missingHeads,
    withoutCaravans,
    isExactMatch,
    validationError,
  };
}

describe('caravan reception arrival count and reconciliation', () => {
  it('correctly reconciles when arrived count matches transit count and all are tagged', () => {
    const result = reconcileReception({
      expected: 8,
      receivedHeads: 8,
      caravansCount: 8,
    });

    expect(result.difference).toBe(0);
    expect(result.missingHeads).toBe(0);
    expect(result.withoutCaravans).toBe(0);
    expect(result.isExactMatch).toBe(true);
    expect(result.validationError).toBeNull();
  });

  it('allows receiving 8 arrived heads with partial 6 caravans, leaving 2 uncaravaned', () => {
    const result = reconcileReception({
      expected: 8,
      receivedHeads: 8,
      caravansCount: 6,
    });

    expect(result.difference).toBe(0);
    expect(result.missingHeads).toBe(0);
    expect(result.withoutCaravans).toBe(2);
    expect(result.validationError).toBeNull();
  });

  it('requires a reason when physically fewer heads arrived than expected', () => {
    const resultNoReason = reconcileReception({
      expected: 8,
      receivedHeads: 7,
      caravansCount: 7,
      reason: '',
    });

    expect(resultNoReason.difference).toBe(-1);
    expect(resultNoReason.missingHeads).toBe(1);
    expect(resultNoReason.validationError).toBe('Indicá el motivo del faltante para registrar la novedad.');

    const resultWithReason = reconcileReception({
      expected: 8,
      receivedHeads: 7,
      caravansCount: 7,
      reason: 'Murió en viaje',
    });

    expect(resultWithReason.validationError).toBeNull();
    expect(resultWithReason.missingHeads).toBe(1);
  });

  it('rejects submissions where caravan count exceeds arrived physical head count', () => {
    const result = reconcileReception({
      expected: 8,
      receivedHeads: 5,
      caravansCount: 6,
      reason: 'Faltante de 3 en transporte',
    });

    expect(result.validationError).toBe('Hay 6 caravanas para 5 cabezas: no puede haber más caravanas que cabezas.');
  });

  it('rejects submissions with 0 caravans advising to use count mode', () => {
    const result = reconcileReception({
      expected: 8,
      receivedHeads: 8,
      caravansCount: 0,
    });

    expect(result.validationError).toBe('Cargá al menos una caravana, o usá "Conteo" para confirmar sólo las cabezas.');
  });
});
