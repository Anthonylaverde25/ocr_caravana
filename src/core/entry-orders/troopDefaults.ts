import { ReceptionCaravan, ReceptionTroop, Sex, inheritedSexOf } from './reception';

export type TroopFieldMode = 'GLOBAL' | 'PER_LINE';

export interface TroopFieldInfo {
  mode: TroopFieldMode;
  /** Value when GLOBAL (e.g. "Hembra", "Ternero", "Brangus Negro") */
  value?: string;
  /** Label/hint when PER_LINE (e.g. "Macho / Hembra", "Por animal", "2 razas declaradas") */
  hint?: string;
}

export interface TroopDefaultsInfo {
  sex: TroopFieldInfo;
  category: TroopFieldInfo;
  breed: TroopFieldInfo;
  /** True when all fields are fixed by the order troop */
  isHomogeneous: boolean;
  /** Short summary of what is fixed (e.g. "Hembras · Ternero · Brangus Negro") */
  summary: string;
}

const SEX_LABEL: Record<Sex, string> = { M: 'Macho', H: 'Hembra' };

/**
 * Determines what the order fixes globally for every animal and what is chosen per caravan.
 * Mirrors the canonical web ING-02/03 logic so phone and web cannot disagree.
 */
export function troopDefaultsOf(troop: ReceptionTroop): TroopDefaultsInfo {
  const inheritedSex = inheritedSexOf(troop);
  const sex: TroopFieldInfo = inheritedSex
    ? { mode: 'GLOBAL', value: SEX_LABEL[inheritedSex] }
    : { mode: 'PER_LINE', hint: 'Macho / Hembra' };

  let category: TroopFieldInfo;
  if (troop.needsCategoryPerAnimal) {
    category = { mode: 'PER_LINE', hint: `${troop.categories.length} categorías posibles` };
  } else if (troop.categories.length === 1) {
    category = { mode: 'GLOBAL', value: troop.categories[0].name };
  } else if (troop.categories.length === 0) {
    category = { mode: 'GLOBAL', value: 'Sin declarar' };
  } else {
    // If each sex admits one category, it is deduced from the animal's sex
    if (inheritedSex) {
      const cat = troop.categories.find((c) => c.sex === 'BOTH' || c.sex === inheritedSex);
      category = { mode: 'GLOBAL', value: cat?.name ?? 'Según sexo' };
    } else {
      category = { mode: 'GLOBAL', value: 'Deducida por sexo' };
    }
  }

  const breedNames = [...new Set(troop.breeds.map((b) => b.breedName))];
  let breed: TroopFieldInfo;
  if (troop.breeds.length === 1) {
    const single = troop.breeds[0];
    const full = single.colorName ? `${single.breedName} ${single.colorName}` : single.breedName;
    breed = { mode: 'GLOBAL', value: full };
  } else if (breedNames.length === 1 && troop.breeds.length > 1) {
    breed = { mode: 'PER_LINE', hint: `${breedNames[0]} (${troop.breeds.length} pelajes)` };
  } else {
    breed = { mode: 'PER_LINE', hint: `${troop.breeds.length} razas / pelajes` };
  }

  const isHomogeneous = sex.mode === 'GLOBAL' && category.mode === 'GLOBAL' && breed.mode === 'GLOBAL';

  const parts = [
    sex.mode === 'GLOBAL' ? sex.value : null,
    category.mode === 'GLOBAL' ? category.value : null,
    breed.mode === 'GLOBAL' ? breed.value : null,
  ].filter(Boolean);

  const summary = parts.join(' · ');

  return { sex, category, breed, isHomogeneous, summary };
}

/**
 * Creates a new caravan and pre-fills every field that is already determined by the troop!
 */
export function newCaravanWithDefaults(tag: string, troop: ReceptionTroop): ReceptionCaravan {
  const inheritedSex = inheritedSexOf(troop);
  const sex = inheritedSex ?? null;

  let categoryPosition: number | null = null;
  if (!troop.needsCategoryPerAnimal) {
    if (troop.categories.length === 1) {
      categoryPosition = troop.categories[0].position;
    } else if (inheritedSex) {
      const cat = troop.categories.find((c) => c.sex === 'BOTH' || c.sex === inheritedSex);
      if (cat) categoryPosition = cat.position;
    }
  }

  let breedName: string | null = null;
  let breedPosition: number | null = null;
  if (troop.breeds.length === 1) {
    breedName = troop.breeds[0].breedName;
    breedPosition = troop.breeds[0].position;
  } else {
    const breedNames = [...new Set(troop.breeds.map((b) => b.breedName))];
    if (breedNames.length === 1) {
      breedName = breedNames[0];
    }
  }

  return {
    tag,
    sex,
    categoryPosition,
    breedName,
    breedPosition,
  };
}
