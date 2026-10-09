import { AnimalRecord, GestationStage, MovementEntry, WeightEntry } from '../../core/caravans/AnimalRecord';
import { Sex } from '../../core/entities/RegistrationSession';
import { api, unwrap } from './ApiClient';
import { CaravanRegistrationApi } from './CaravanRegistrationApi';

export type RecordLookup =
  | { kind: 'found'; record: AnimalRecord; weights: WeightEntry[]; movements: MovementEntry[] }
  | { kind: 'not_found'; identification: string }
  | { kind: 'other_company'; identification: string };

/** How the system leaves an unknown RENSPA. */
const NO_RENSPA = 'NO_DEFINIDO';

interface CaravanJson {
  id: number;
  identification: string;
  sex: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  breed: string | null;
  color: string | null;
  teeth: number | null;
  current_weight: number | string | null;
  entry_weight: number | string | null;
  entry_date: string | null;
  renspa: string | null;
  provider_name: string | null;
  batch: { name: string | null; farm_name: string | null } | null;
  physiological_state: { label: string; is_pregnant: boolean; is_nursing: boolean } | null;
  active_gestation: {
    gestation_stage: string | null;
    gestation_months: number | string | null;
    estimated_due_date: string | null;
    sires: { identification: string | null; is_confirmed: boolean }[];
  } | null;
  lineage: { mother_identification: string | null; father_identification: string | null; birth_date: string | null } | null;
  stillborn_count: number | null;
}

export const CaravanRecordApi = {
  /**
   * Classifies the caravan first (the same lookup the registration uses) and only then opens the
   * record: another company's animal is reported without its data. Weighings and movements are
   * extras; if they fail the record is still shown.
   */
  async find(eid: string): Promise<RecordLookup> {
    const [result] = await CaravanRegistrationApi.lookup([eid]);

    if (!result || result.status === 'not_found') return { kind: 'not_found', identification: eid };
    if (result.status === 'other_company' || result.caravan_id === undefined) {
      return { kind: 'other_company', identification: eid };
    }

    const id = result.caravan_id;
    const [caravan, weights, movements] = await Promise.all([
      api.get<{ data: CaravanJson }>(`/caravans/${id}`).then((r) => r.data.data),
      api.get(`/caravans/${id}/weights`).then((r) => unwrap<{ weight: number | string; weighing_date: string }>(r.data)).catch(() => []),
      api.get(`/caravans/${id}/movements`).then((r) => unwrap<{ type: string; movement_date: string; observations: string | null }>(r.data)).catch(() => []),
    ]);

    return {
      kind: 'found',
      record: toRecord(caravan),
      weights: weights.map((w) => ({ weight: Number(w.weight), date: w.weighing_date })),
      movements: movements
        .map((m) => ({ type: m.type, date: m.movement_date, observations: m.observations }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    };
  },
};

function toRecord(c: CaravanJson): AnimalRecord {
  const gestation = c.active_gestation;
  return {
    id: c.id,
    identification: c.identification,
    sex: c.sex === 'M' || c.sex === 'H' ? (c.sex as Sex) : null,
    categoryName: c.category_name,
    subcategoryName: c.subcategory_name,
    breedName: c.breed,
    colorName: c.color,
    teeth: c.teeth,
    currentWeight: toNumber(c.current_weight),
    entryWeight: toNumber(c.entry_weight),
    entryMonth: c.entry_date,
    renspa: c.renspa && c.renspa !== NO_RENSPA ? c.renspa : null,
    providerName: c.provider_name,
    batchName: c.batch?.name ?? null,
    farmName: c.batch?.farm_name ?? null,
    physiological: c.physiological_state
      ? { label: c.physiological_state.label, isPregnant: c.physiological_state.is_pregnant, isNursing: c.physiological_state.is_nursing }
      : null,
    gestation: gestation
      ? {
          stage: isStage(gestation.gestation_stage) ? gestation.gestation_stage : null,
          months: toNumber(gestation.gestation_months),
          estimatedDueDate: gestation.estimated_due_date,
          sires: gestation.sires
            .filter((s) => s.identification)
            .map((s) => ({ identification: s.identification as string, confirmed: s.is_confirmed })),
        }
      : null,
    lineage: c.lineage
      ? { mother: c.lineage.mother_identification, father: c.lineage.father_identification, birthDate: c.lineage.birth_date }
      : null,
    stillbornCount: c.stillborn_count ?? 0,
  };
}

/** Laravel sends decimals as strings. */
function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isStage(value: string | null): value is GestationStage {
  return value === 'head' || value === 'body' || value === 'tail';
}
