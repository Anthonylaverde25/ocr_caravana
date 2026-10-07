/**
 * The reception of a DTE with its caravans, as the API applies it (EntryOrderReceptionService):
 * each caravan says only what the order leaves open. A troop of one sex gives every caravan its
 * sex; a sex that admits a single category of the order gives it its category; an order of one
 * breed line gives it its breed and coat. What is left open is chosen per caravan here, with the
 * same rules as the web reception, so the phone and the system cannot disagree.
 */

export type Sex = 'M' | 'H';

export interface TroopCategory {
  position: number;
  name: string;
  /** animal_categories.sex: a heifer category is H, a calf category BOTH. */
  sex: 'M' | 'H' | 'BOTH' | null;
}

export interface TroopBreedLine {
  position: number;
  breedName: string;
  colorName: string | null;
}

/** What the order declares about its animals. */
export interface ReceptionTroop {
  sexComposition: 'MALE' | 'FEMALE' | 'MIXED' | null;
  categories: TroopCategory[];
  breeds: TroopBreedLine[];
  /** Some sex admits several categories: those caravans say which. */
  needsCategoryPerAnimal: boolean;
}

/** One caravan of the reception and what was chosen for it. */
export interface ReceptionCaravan {
  tag: string;
  sex: Sex | null;
  categoryPosition: number | null;
  /** The breed chosen while its coat is still to choose. */
  breedName: string | null;
  breedPosition: number | null;
}

export type Choice<T> = { kind: 'fixed'; label: string } | { kind: 'pick'; value: T | null; options: { value: T; label: string }[] };

const SEX_WORD: Record<Sex, string> = { M: 'Macho', H: 'Hembra' };

export const inheritedSexOf = (troop: ReceptionTroop): Sex | null =>
  troop.sexComposition === 'MALE' ? 'M' : troop.sexComposition === 'FEMALE' ? 'H' : null;

const admits = (category: TroopCategory, sex: Sex): boolean => category.sex === 'BOTH' || category.sex === sex;

export const newCaravan = (tag: string): ReceptionCaravan => ({ tag, sex: null, categoryPosition: null, breedName: null, breedPosition: null });

/**
 * Sex, category, breed and coat of a caravan: fixed by the order (shown, not asked) or to pick.
 * The category depends on the sex: with no sex yet, every category of the order is offered.
 */
export function caravanChoices(troop: ReceptionTroop, caravan: ReceptionCaravan) {
  const sex = caravan.sex ?? inheritedSexOf(troop);
  const categories = sex ? troop.categories.filter((c) => admits(c, sex)) : troop.categories;
  const line = troop.breeds.find((b) => b.position === caravan.breedPosition) ?? null;
  const breedNames = [...new Set(troop.breeds.map((b) => b.breedName))];
  const breedName = line?.breedName ?? caravan.breedName ?? (breedNames.length === 1 ? breedNames[0] : null);
  const coats = troop.breeds.filter((b) => b.breedName === breedName);

  const sexChoice: Choice<Sex> =
    troop.sexComposition === 'MIXED' || troop.sexComposition === null
      ? { kind: 'pick', value: caravan.sex, options: (['M', 'H'] as Sex[]).map((value) => ({ value, label: SEX_WORD[value] })) }
      : { kind: 'fixed', label: SEX_WORD[inheritedSexOf(troop) as Sex] };

  const categoryChoice: Choice<number> =
    // Without a category per animal it follows from the sex: one per sex at most.
    troop.needsCategoryPerAnimal && categories.length > 1
      ? { kind: 'pick', value: caravan.categoryPosition, options: categories.map((c) => ({ value: c.position, label: c.name })) }
      : { kind: 'fixed', label: categories.length === 1 ? categories[0].name : sex || troop.categories.length === 0 ? '—' : 'Según el sexo' };

  const breedChoice: Choice<string> =
    breedNames.length > 1
      ? { kind: 'pick', value: breedName, options: breedNames.map((name) => ({ value: name, label: name })) }
      : { kind: 'fixed', label: breedNames[0] ?? 'Sin declarar' };

  const coatChoice: Choice<number> =
    coats.length > 1
      ? { kind: 'pick', value: caravan.breedPosition, options: coats.map((c) => ({ value: c.position, label: c.colorName ?? 'Sin pelaje' })) }
      : { kind: 'fixed', label: coats.length === 1 ? (coats[0].colorName ?? '—') : '—' };

  return { sex: sexChoice, category: categoryChoice, breed: breedChoice, coat: coatChoice };
}

/** Choosing a sex drops a category it does not admit. */
export function withSex(troop: ReceptionTroop, caravan: ReceptionCaravan, sex: Sex | null): ReceptionCaravan {
  const category = troop.categories.find((c) => c.position === caravan.categoryPosition);

  return { ...caravan, sex, categoryPosition: category && sex && !admits(category, sex) ? null : caravan.categoryPosition };
}

/** Choosing a breed: its only line when the order has it in one coat; otherwise the coat is still to choose. */
export function withBreed(troop: ReceptionTroop, caravan: ReceptionCaravan, breedName: string | null): ReceptionCaravan {
  const lines = troop.breeds.filter((b) => b.breedName === breedName);

  return { ...caravan, breedName, breedPosition: lines.length === 1 ? lines[0].position : null };
}

/**
 * What the caravan still has to say before it can be sent: the sex on a troop of both sexes, the
 * category when its sex admits several, and — on an order of several breeds — its breed and coat.
 */
export function missingOf(troop: ReceptionTroop, caravan: ReceptionCaravan): string[] {
  const choices = caravanChoices(troop, caravan);
  const missing: string[] = [];

  if (choices.sex.kind === 'pick' && caravan.sex === null) missing.push('sexo');
  if (choices.category.kind === 'pick' && caravan.categoryPosition === null) missing.push('categoría');
  if (choices.breed.kind === 'pick' && choices.breed.value === null) missing.push('raza');
  else if (choices.coat.kind === 'pick' && caravan.breedPosition === null) missing.push('pelaje');

  return missing;
}

/** The animal as POST /entry-orders/{id}/receive takes it: only what the order leaves open. */
export function toReceivedAnimal(troop: ReceptionTroop, caravan: ReceptionCaravan) {
  const choices = caravanChoices(troop, caravan);
  const line = troop.breeds.length > 1 ? caravan.breedPosition : null;

  return {
    caravana: caravan.tag,
    sex: choices.sex.kind === 'pick' ? caravan.sex : null,
    category_position: choices.category.kind === 'pick' ? caravan.categoryPosition : null,
    breed_position: line,
  };
}

/** "0331, 0332 0333" → each tag once, in order, without the ones already in `known`. */
export function parseTags(text: string, known: string[] = []): string[] {
  const seen = new Set(known.map((t) => t.toUpperCase()));

  return text
    .split(/[\s,;]+/)
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t !== '' && !seen.has(t) && Boolean(seen.add(t)));
}

export interface RowError {
  row: number;
  field: string;
  message: string;
}

/** The server reports problems by the index of the animal sent: back to the caravan they are about. */
export function errorsByTag(sentTags: string[], rowErrors: RowError[]): Record<string, string[]> {
  const byTag: Record<string, string[]> = {};

  rowErrors.forEach((error) => {
    const tag = sentTags[error.row];

    if (tag !== undefined) (byTag[tag] ??= []).push(error.message);
  });

  return byTag;
}

/** The calendar day where the phone is, "2026-10-06": the reception happened that day there, not in UTC. */
export function localDateString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
