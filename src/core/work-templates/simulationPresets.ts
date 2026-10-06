/**
 * Pure domain simulation presets for Work Template scanning.
 * Complies with AGENTS.md simulation test standards (Happy Path, Warning Flow, Repair Flow).
 * Invariant: Must not import react-native, expo, axios, or MMKV.
 */

import { SimulationPreset, WorkTemplateCode, ScanSimulationScenario } from './types';

export const SIMULATION_PRESETS: Record<string, SimulationPreset> = {
  // --- ING-01 ---
  'ING-01_HAPPY_PATH': {
    code: 'ING-01',
    title: 'Ingreso de Compra Directa',
    description: 'Tropa estándar de compra con caravanas válidas, pesos balanceados y DTE.',
    scenario: 'HAPPY_PATH',
    context: {
      batch_name: 'TROPA INGRESO ABERDEEN',
      entry_date: '2026-03-15',
      activity_name: 'Invernada / Engorde',
      provider_cuit: '30-71234567-8',
      provider_renspa: '01.023.0.00456/00',
      guia_dte: 'DTE-2026-004812',
    },
    rows: [
      {
        id: 'ing-1',
        caravana: '085401928374615',
        category: 'Novillito',
        sex: 'M',
        breed: 'Angus Negro',
        teeth: 2,
        entry_weight: 342.5,
        observations: 'Buen estado general',
        confidence: 0.98,
      },
      {
        id: 'ing-2',
        caravana: '085401928374616',
        category: 'Novillito',
        sex: 'M',
        breed: 'Angus Colorado',
        teeth: 2,
        entry_weight: 358.0,
        observations: 'Desparasitado en origen',
        confidence: 0.97,
      },
      {
        id: 'ing-3',
        caravana: '085401928374617',
        category: 'Vaquillona',
        sex: 'H',
        breed: 'Braford',
        teeth: 4,
        entry_weight: 385.0,
        observations: 'Caravana visible oreja izq',
        confidence: 0.96,
      },
      {
        id: 'ing-4',
        caravana: '085401928374618',
        category: 'Novillito',
        sex: 'M',
        breed: 'Careta',
        teeth: 2,
        entry_weight: 331.0,
        observations: '',
        confidence: 0.94,
      },
      {
        id: 'ing-5',
        caravana: '085401928374619',
        category: 'Novillito',
        sex: 'M',
        breed: 'Brangus',
        teeth: 2,
        entry_weight: 366.5,
        observations: 'Aplomos correctos',
        confidence: 0.99,
      },
    ],
  },
  'ING-01_WARNING_FLOW': {
    code: 'ING-01',
    title: 'Ingreso con Alertas de Peso',
    description: 'Tropa con pesos extremos fuera de rango y caravana con baja confianza de OCR.',
    scenario: 'WARNING_FLOW',
    context: {
      batch_name: 'TROPA REVISIÓN PESOS',
      entry_date: '2026-03-15',
      activity_name: 'Cría',
      guia_dte: 'DTE-2026-004813',
    },
    rows: [
      {
        id: 'ing-w-1',
        caravana: '085401928374620',
        category: 'Ternero',
        sex: 'M',
        breed: 'Angus',
        teeth: 0,
        entry_weight: 45.0,
        observations: 'Peso atípicamente bajo',
        confidence: 0.92,
        hasWarning: true,
        warningMessage: 'Peso por debajo del umbral mínimo (45 kg)',
      },
      {
        id: 'ing-w-2',
        caravana: '085401928374621',
        category: 'Novillo',
        sex: 'M',
        breed: 'Hereford',
        teeth: 6,
        entry_weight: 710.0,
        observations: 'Pesaje extremo',
        confidence: 0.88,
        hasWarning: true,
        warningMessage: 'Peso por encima de rango habitual (>700 kg)',
      },
      {
        id: 'ing-w-3',
        caravana: '085401928374622',
        category: 'Vaquillona',
        sex: 'H',
        breed: 'Cruza',
        teeth: 2,
        entry_weight: 320.0,
        observations: 'Número borroso en planilla',
        confidence: 0.65,
        hasWarning: true,
        warningMessage: 'Confianza de OCR baja (65%)',
      },
    ],
  },

  // --- TOR-01 ---
  'TOR-01_HAPPY_PATH': {
    code: 'TOR-01',
    title: 'Revisación Andrológica y Muestreo',
    description: 'Evaluación física completa, CE, CC y tubos de raspaje y serología asignados.',
    scenario: 'HAPPY_PATH',
    context: {
      establishment: 'Cabaña El Ombú',
      evaluation_date: '2026-03-16',
      veterinarian_name: 'Dr. Martín E. Gómez',
      veterinarian_license: 'MP-4821-BA',
      sample_round: 1,
    },
    rows: [
      {
        id: 'tor-1',
        caravana: 'TORO-0101',
        ce_cm: 38.5,
        bcs: 3.5,
        libido: 'ALTA',
        aplomos: 'Correctos',
        scrape_collected: true,
        scrape_tube: 'R-01',
        serology_collected: true,
        serology_tube: 'S-01',
        physical_verdict: 'Apto',
        observations: 'Excelente conformación testicular',
        confidence: 0.99,
      },
      {
        id: 'tor-2',
        caravana: 'TORO-0102',
        ce_cm: 37.0,
        bcs: 3.0,
        libido: 'MEDIA',
        aplomos: 'Correctos',
        scrape_collected: true,
        scrape_tube: 'R-02',
        serology_collected: true,
        serology_tube: 'S-02',
        physical_verdict: 'Apto',
        observations: 'Testículos simétricos y elásticos',
        confidence: 0.98,
      },
      {
        id: 'tor-3',
        caravana: 'TORO-0103',
        ce_cm: 36.5,
        bcs: 3.0,
        libido: 'MEDIA',
        aplomos: 'Garrones rectos leves',
        scrape_collected: true,
        scrape_tube: 'R-03',
        serology_collected: true,
        serology_tube: 'S-03',
        physical_verdict: 'Apto',
        observations: 'Apto condicional por aplomos',
        confidence: 0.95,
      },
    ],
  },
  'TOR-01_WARNING_FLOW': {
    code: 'TOR-01',
    title: 'Revisación con Alerta de CE y Descarte',
    description: 'Toro con circunferencia escrotal subóptima y veredicto de No Apto.',
    scenario: 'WARNING_FLOW',
    context: {
      establishment: 'Estancia La Carlota',
      evaluation_date: '2026-03-16',
      veterinarian_name: 'Dra. Carolina Ríos',
      sample_round: 2,
    },
    rows: [
      {
        id: 'tor-w-1',
        caravana: 'TORO-0205',
        ce_cm: 29.0,
        bcs: 2.0,
        libido: 'BAJA',
        aplomos: 'Defectuosos',
        scrape_collected: false,
        scrape_tube: '',
        serology_collected: true,
        serology_tube: 'S-08',
        physical_verdict: 'No Apto',
        observations: 'Hipoplasia testicular marcada',
        confidence: 0.96,
        hasWarning: true,
        warningMessage: 'CE inferior a 30 cm — No apto reproductor',
      },
    ],
  },

  // --- PAR-01 ---
  'PAR-01_HAPPY_PATH': {
    code: 'PAR-01',
    title: 'Planilla de Parición',
    description: 'Partos normales con madre, cría identificada, sexo y peso al nacer.',
    scenario: 'HAPPY_PATH',
    context: {
      lote: 'RODEO MATERNIDAD POTRERO 4',
      entry_date: '2026-03-14',
      responsable: 'Capataz Juan Pérez',
    },
    rows: [
      {
        id: 'par-1',
        caravana: '085401928001111',
        calf_caravan: 'TER-2026-001',
        calf_sex: 'M',
        calf_weight: 34.0,
        calving_date: '2026-03-14',
        observations: 'Parto natural sin asistencia',
        confidence: 0.98,
      },
      {
        id: 'par-2',
        caravana: '085401928001112',
        calf_caravan: 'TER-2026-002',
        calf_sex: 'H',
        calf_weight: 31.5,
        calving_date: '2026-03-14',
        observations: 'Cría vigorosa, mamó calostro',
        confidence: 0.97,
      },
      {
        id: 'par-3',
        caravana: '085401928001113',
        calf_caravan: 'TER-2026-003',
        calf_sex: 'M',
        calf_weight: 38.0,
        calving_date: '2026-03-14',
        observations: 'Parto asistido leve (tracción)',
        confidence: 0.95,
      },
    ],
  },

  // --- DEST-01 ---
  'DEST-01_HAPPY_PATH': {
    code: 'DEST-01',
    title: 'Destete y Conformación de Lote',
    description: 'Destete tradicional con pesaje de terneros y madre identificada.',
    scenario: 'HAPPY_PATH',
    context: {
      source_batch: 'VIENTRES CON CRÍA POTRERO 2',
      target_batch: 'RECRÍA DESTETE 2026',
      weaning_date: '2026-03-15',
    },
    rows: [
      {
        id: 'dest-1',
        caravana: '085401928374901',
        caravana_madre: '085401928000501',
        entry_weight: 184.0,
        target_batch: 'RECRÍA DESTETE 2026',
        observations: 'Desmadre sin estrés',
        confidence: 0.98,
      },
      {
        id: 'dest-2',
        caravana: '085401928374902',
        caravana_madre: '085401928000502',
        entry_weight: 195.5,
        target_batch: 'RECRÍA DESTETE 2026',
        observations: 'Vacunado contra mancha y gangrena',
        confidence: 0.97,
      },
      {
        id: 'dest-3',
        caravana: '085401928374903',
        caravana_madre: '085401928000503',
        entry_weight: 172.0,
        target_batch: 'RECRÍA DESTETE 2026',
        observations: 'Corte de lactancia efectivo',
        confidence: 0.96,
      },
    ],
  },

  // --- LSER-01 ---
  'LSER-01_HAPPY_PATH': {
    code: 'LSER-01',
    title: 'Lote de Servicio — Toro Único',
    description: 'Entore con asignación de toro exclusivo y vientres seleccionados.',
    scenario: 'HAPPY_PATH',
    context: {
      lote: 'LOTE ENTORE PRIMAVERA',
      toro_caravana: '085401928999001',
      planned_start_date: '2026-03-20',
      planned_end_date: '2026-05-20',
      responsable: 'Ing. Agr. Roberto Bianchi',
    },
    rows: [
      {
        id: 'lser-1',
        caravana: '085401928002010',
        category: 'Vaquillona 15m',
        breed: 'Angus',
        bcs: 3.5,
        observations: 'Ciclando normalmente',
        confidence: 0.97,
      },
      {
        id: 'lser-2',
        caravana: '085401928002011',
        category: 'Vaquillona 15m',
        breed: 'Angus',
        bcs: 3.5,
        observations: 'Pelaje sano',
        confidence: 0.98,
      },
      {
        id: 'lser-3',
        caravana: '085401928002012',
        category: 'Vaquillona 15m',
        breed: 'Angus',
        bcs: 3.0,
        observations: '',
        confidence: 0.96,
      },
    ],
  },
};

export const AVAILABLE_SIMULATIONS: { code: WorkTemplateCode; title: string; scenario: ScanSimulationScenario; label: string }[] = [
  { code: 'ING-01', title: 'Ingreso Compra Directa', scenario: 'HAPPY_PATH', label: 'ING-01 (Happy Path)' },
  { code: 'ING-01', title: 'Ingreso Compra Directa', scenario: 'WARNING_FLOW', label: 'ING-01 (Alertas de Peso)' },
  { code: 'TOR-01', title: 'Revisación Andrológica', scenario: 'HAPPY_PATH', label: 'TOR-01 (Happy Path)' },
  { code: 'TOR-01', title: 'Revisación Andrológica', scenario: 'WARNING_FLOW', label: 'TOR-01 (Toro No Apto / CE)' },
  { code: 'PAR-01', title: 'Planilla de Parición', scenario: 'HAPPY_PATH', label: 'PAR-01 (Maternidad / Partos)' },
  { code: 'DEST-01', title: 'Destete y Desmadre', scenario: 'HAPPY_PATH', label: 'DEST-01 (Destete Terneros)' },
  { code: 'LSER-01', title: 'Lote de Servicio (Toro Único)', scenario: 'HAPPY_PATH', label: 'LSER-01 (Entore / Servicio)' },
];

export function getSimulationPreset(code: WorkTemplateCode, scenario: ScanSimulationScenario = 'HAPPY_PATH'): SimulationPreset {
  const key = `${code}_${scenario}`;
  if (SIMULATION_PRESETS[key]) {
    return SIMULATION_PRESETS[key];
  }
  const fallbackKey = `${code}_HAPPY_PATH`;
  if (SIMULATION_PRESETS[fallbackKey]) {
    return SIMULATION_PRESETS[fallbackKey];
  }
  return SIMULATION_PRESETS['ING-01_HAPPY_PATH'];
}
