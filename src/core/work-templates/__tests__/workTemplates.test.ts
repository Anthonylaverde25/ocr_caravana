import { getSimulationPreset, SIMULATION_PRESETS, AVAILABLE_SIMULATIONS } from '../simulationPresets';

describe('Work Templates Domain Presets', () => {
  it('returns valid simulation preset for ING-01 Happy Path', () => {
    const preset = getSimulationPreset('ING-01', 'HAPPY_PATH');
    expect(preset.code).toBe('ING-01');
    expect(preset.scenario).toBe('HAPPY_PATH');
    expect(preset.rows.length).toBeGreaterThan(0);
    expect(preset.context.batch_name).toBeDefined();
    for (const row of preset.rows) {
      expect(row.caravana).toBeTruthy();
      expect(row.confidence).toBeGreaterThan(0.5);
    }
  });

  it('returns warning scenario preset for ING-01 with warning messages', () => {
    const preset = getSimulationPreset('ING-01', 'WARNING_FLOW');
    expect(preset.code).toBe('ING-01');
    expect(preset.scenario).toBe('WARNING_FLOW');
    const warningRows = preset.rows.filter((r) => r.hasWarning);
    expect(warningRows.length).toBeGreaterThan(0);
  });

  it('provides all mandatory templates (ING-01, TOR-01, PAR-01, DEST-01, LSER-01)', () => {
    const expectedCodes = ['ING-01', 'TOR-01', 'PAR-01', 'DEST-01', 'LSER-01'];
    for (const code of expectedCodes) {
      const preset = getSimulationPreset(code);
      expect(preset.code).toBe(code);
      expect(preset.rows.length).toBeGreaterThan(0);
    }
  });

  it('falls back to default preset when unknown template is requested', () => {
    const preset = getSimulationPreset('UNKNOWN-99');
    expect(preset).toBeDefined();
    expect(preset.code).toBe('ING-01');
  });

  it('has entries in AVAILABLE_SIMULATIONS matching presets', () => {
    expect(AVAILABLE_SIMULATIONS.length).toBeGreaterThanOrEqual(5);
    for (const item of AVAILABLE_SIMULATIONS) {
      const key = `${item.code}_${item.scenario}`;
      expect(SIMULATION_PRESETS[key]).toBeDefined();
    }
  });
});
