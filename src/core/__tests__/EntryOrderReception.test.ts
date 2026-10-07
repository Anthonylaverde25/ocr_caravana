import {
  ReceptionTroop,
  caravanChoices,
  errorsByTag,
  localDateString,
  missingOf,
  newCaravan,
  parseTags,
  toReceivedAnimal,
  withBreed,
  withSex,
} from '../entry-orders/reception';

const homogeneous: ReceptionTroop = {
  sexComposition: 'MALE',
  categories: [{ position: 1, name: 'Ternero', sex: 'BOTH' }],
  breeds: [{ position: 1, breedName: 'Braford', colorName: 'Colorado' }],
  needsCategoryPerAnimal: false,
};

// Both sexes; a female may be Ternero or Vaca Adulta; Braford Colorado, Braford Pampa, Brangus Negro.
const open: ReceptionTroop = {
  sexComposition: 'MIXED',
  categories: [
    { position: 1, name: 'Ternero', sex: 'BOTH' },
    { position: 2, name: 'Vaca Adulta', sex: 'H' },
  ],
  breeds: [
    { position: 1, breedName: 'Braford', colorName: 'Colorado' },
    { position: 2, breedName: 'Braford', colorName: 'Pampa' },
    { position: 3, breedName: 'Brangus', colorName: 'Negro' },
  ],
  needsCategoryPerAnimal: true,
};

describe('entry order reception', () => {
  it('fills in everything a homogeneous order fixes and asks nothing', () => {
    const caravan = newCaravan('UY-1');
    const choices = caravanChoices(homogeneous, caravan);

    expect(choices.sex).toEqual({ kind: 'fixed', label: 'Macho' });
    expect(choices.category).toEqual({ kind: 'fixed', label: 'Ternero' });
    expect(choices.breed).toEqual({ kind: 'fixed', label: 'Braford' });
    expect(choices.coat).toEqual({ kind: 'fixed', label: 'Colorado' });
    expect(missingOf(homogeneous, caravan)).toEqual([]);
    expect(toReceivedAnimal(homogeneous, caravan)).toEqual({ caravana: 'UY-1', sex: null, category_position: null, breed_position: null });
  });

  it('asks the sex, category, breed and coat an open order leaves to each caravan', () => {
    expect(missingOf(open, newCaravan('UY-2'))).toEqual(['sexo', 'categoría', 'raza']);
  });

  it('a male only admits the categories of males', () => {
    const male = withSex(open, newCaravan('UY-3'), 'M');

    expect(caravanChoices(open, male).category).toEqual({ kind: 'fixed', label: 'Ternero' });
    expect(missingOf(open, male)).toEqual(['raza']);
  });

  it('changing the sex drops a category it does not admit', () => {
    const female = { ...withSex(open, newCaravan('UY-4'), 'H'), categoryPosition: 2 };

    expect(withSex(open, female, 'M').categoryPosition).toBeNull();
  });

  it('a breed in one coat names its line; in several, the coat is still to choose', () => {
    const brangus = withBreed(open, newCaravan('UY-5'), 'Brangus');
    const braford = withBreed(open, newCaravan('UY-6'), 'Braford');

    expect(brangus.breedPosition).toBe(3);
    expect(braford.breedPosition).toBeNull();
    expect(caravanChoices(open, braford).coat).toMatchObject({ kind: 'pick', options: [{ value: 1, label: 'Colorado' }, { value: 2, label: 'Pampa' }] });
    expect(missingOf(open, { ...withSex(open, braford, 'M') })).toEqual(['pelaje']);
  });

  it('sends only what the order leaves open', () => {
    const caravan = { ...withBreed(open, withSex(open, newCaravan('UY-7'), 'H'), 'Brangus'), categoryPosition: 2 };

    expect(toReceivedAnimal(open, caravan)).toEqual({ caravana: 'UY-7', sex: 'H', category_position: 2, breed_position: 3 });
  });

  it('a mixed troop with one category per sex takes it from the sex', () => {
    const bySex: ReceptionTroop = {
      ...open,
      categories: [
        { position: 1, name: 'Novillito', sex: 'M' },
        { position: 2, name: 'Vaquillona', sex: 'H' },
      ],
      needsCategoryPerAnimal: false,
    };

    expect(caravanChoices(bySex, newCaravan('UY-8')).category).toEqual({ kind: 'fixed', label: 'Según el sexo' });
    expect(caravanChoices(bySex, withSex(bySex, newCaravan('UY-8'), 'H')).category).toEqual({ kind: 'fixed', label: 'Vaquillona' });
  });

  it('splits a pasted list and skips the tags already loaded', () => {
    expect(parseTags('a1, A2 a3\na1;A4', ['A3'])).toEqual(['A1', 'A2', 'A4']);
  });

  it('puts the server errors back on their caravans', () => {
    expect(errorsByTag(['A', 'B'], [{ row: 1, field: 'sex', message: 'Falta el sexo' }])).toEqual({ B: ['Falta el sexo'] });
  });

  it('dates the reception on the local calendar day, not in UTC', () => {
    expect(localDateString(new Date(2026, 9, 6, 23, 30))).toBe('2026-10-06');
  });
});
