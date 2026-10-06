/**
 * Pure domain types for Work Templates scanning and digitisation.
 * Invariant: Must not import react-native, expo, axios, or MMKV.
 */

export type WorkTemplateCode =
  | 'ING-01'
  | 'TOR-01'
  | 'LSER-01'
  | 'DEST-01'
  | 'PAR-01'
  | 'CACT-01'
  | 'ING-02'
  | 'ING-03'
  | string;

export interface WorkTemplateInfo {
  code: WorkTemplateCode;
  title: string;
  category: string;
  description?: string;
}

export interface WorkTemplateContext {
  batch_name?: string;
  entry_date?: string;
  activity_name?: string;
  provider_cuit?: string;
  provider_renspa?: string;
  guia_dte?: string;
  evaluation_date?: string;
  veterinarian_name?: string;
  veterinarian_license?: string;
  sample_round?: number;
  establishment?: string;
  lote?: string;
  toro_caravana?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  responsable?: string;
  source_batch?: string;
  target_batch?: string;
  weaning_date?: string;
  order_code?: string;
  observaciones?: string;
}

export interface WorkTemplateScanRow {
  id: string;
  caravana: string;
  category?: string;
  sex?: string;
  breed?: string;
  teeth?: number | string;
  entry_weight?: number | string;
  ce_cm?: number | string;
  bcs?: number | string;
  libido?: string;
  aplomos?: string;
  scrape_collected?: boolean;
  scrape_tube?: string;
  serology_collected?: boolean;
  serology_tube?: string;
  physical_verdict?: string;
  caravana_madre?: string;
  calf_caravan?: string;
  calf_sex?: string;
  calf_weight?: number | string;
  calving_date?: string;
  target_batch?: string;
  observations?: string;
  confidence: number;
  hasWarning?: boolean;
  warningMessage?: string;
}

export interface WorkTemplateScanResult {
  templateCode: WorkTemplateCode;
  templateTitle: string;
  category: string;
  suggestedWorkdayCode?: string;
  context: WorkTemplateContext;
  rows: WorkTemplateScanRow[];
  sourceImageUri?: string;
  sourceImageName?: string;
  timestamp: string;
}

export type ScanSimulationScenario = 'HAPPY_PATH' | 'WARNING_FLOW' | 'REPAIR_FLOW';

export interface SimulationPreset {
  code: WorkTemplateCode;
  title: string;
  description: string;
  scenario: ScanSimulationScenario;
  context: WorkTemplateContext;
  rows: WorkTemplateScanRow[];
}
