/**
 * A simulated scan (protocol §5.C): a sheet as `identify` would answer it, so it walks the same
 * review as a photo, without the AI agent. Invariant: pure TypeScript.
 */

import type { ScanSimulationScenario } from '../types';
import type { IdentifyResponse } from './types';

export interface SheetPreset {
  code: string;
  scenario: ScanSimulationScenario;
  label: string;
  description: string;
  fileName: string;
  response: IdentifyResponse;
}
