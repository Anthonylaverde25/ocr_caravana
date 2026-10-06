/**
 * Which templates the app reviews and registers, and how. A template with a module goes through
 * the common review (dry run, then save); ING-01 and TOR-01 still use the previous screen; any other
 * is read but registered from the web. Invariant: pure TypeScript.
 */

import { par01Module } from './par01/par01Module';
import { PAR01_PRESETS } from './par01/par01Presets';
import type { SheetPreset } from './sheet/presets';
import type { SheetModule } from './sheet/types';

export const SHEET_MODULES: Record<string, SheetModule> = {
  'PAR-01': par01Module,
};

/** Saved through the previous, template-specific screen. */
export const LEGACY_CODES = ['ING-01', 'TOR-01'];

export const SHEET_PRESETS: SheetPreset[] = [...PAR01_PRESETS];

export const moduleFor = (code: string): SheetModule | undefined => SHEET_MODULES[code.toUpperCase()];
