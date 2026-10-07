import { ReceptionTroop } from '../reception';
import { newCaravanWithDefaults, troopDefaultsOf } from '../troopDefaults';

describe('troopDefaults', () => {
  it('detects a 100% homogeneous order (Order 8 style)', () => {
    const order8Troop: ReceptionTroop = {
      sexComposition: 'FEMALE',
      categories: [{ position: 1, name: 'Ternero', sex: 'BOTH' }],
      breeds: [{ position: 1, breedName: 'Brangus', colorName: 'Negro' }],
      needsCategoryPerAnimal: false,
    };

    const defaults = troopDefaultsOf(order8Troop);

    expect(defaults.isHomogeneous).toBe(true);
    expect(defaults.sex).toEqual({ mode: 'GLOBAL', value: 'Hembra' });
    expect(defaults.category).toEqual({ mode: 'GLOBAL', value: 'Ternero' });
    expect(defaults.breed).toEqual({ mode: 'GLOBAL', value: 'Brangus Negro' });
    expect(defaults.summary).toBe('Hembra · Ternero · Brangus Negro');

    const caravan = newCaravanWithDefaults('TAG001', order8Troop);
    expect(caravan.tag).toBe('TAG001');
    expect(caravan.sex).toBe('H');
    expect(caravan.categoryPosition).toBe(1);
    expect(caravan.breedName).toBe('Brangus');
    expect(caravan.breedPosition).toBe(1);
  });

  it('detects a heterogeneous order with mixed sex and 2 breeds (Order 1 style)', () => {
    const order1Troop: ReceptionTroop = {
      sexComposition: 'MIXED',
      categories: [{ position: 1, name: 'Ternero', sex: 'BOTH' }],
      breeds: [
        { position: 1, breedName: 'Braford', colorName: 'Colorado' },
        { position: 2, breedName: 'Brangus', colorName: 'Negro' },
      ],
      needsCategoryPerAnimal: false,
    };

    const defaults = troopDefaultsOf(order1Troop);

    expect(defaults.isHomogeneous).toBe(false);
    expect(defaults.sex.mode).toBe('PER_LINE');
    expect(defaults.category).toEqual({ mode: 'GLOBAL', value: 'Ternero' });
    expect(defaults.breed.mode).toBe('PER_LINE');

    const caravan = newCaravanWithDefaults('TAG002', order1Troop);
    expect(caravan.tag).toBe('TAG002');
    expect(caravan.sex).toBeNull();
    expect(caravan.categoryPosition).toBe(1); // single category still preloaded
    expect(caravan.breedName).toBeNull();
    expect(caravan.breedPosition).toBeNull();
  });

  it('detects an order where each sex admits one category', () => {
    const multiSexTroop: ReceptionTroop = {
      sexComposition: 'MIXED',
      categories: [
        { position: 1, name: 'Novillito', sex: 'M' },
        { position: 2, name: 'Vaquillona', sex: 'H' },
      ],
      breeds: [{ position: 1, breedName: 'Angus', colorName: 'Negro' }],
      needsCategoryPerAnimal: false,
    };

    const defaults = troopDefaultsOf(multiSexTroop);

    expect(defaults.isHomogeneous).toBe(false);
    expect(defaults.sex.mode).toBe('PER_LINE');
    expect(defaults.category).toEqual({ mode: 'GLOBAL', value: 'Deducida por sexo' });
    expect(defaults.breed).toEqual({ mode: 'GLOBAL', value: 'Angus Negro' });

    const caravan = newCaravanWithDefaults('TAG003', multiSexTroop);
    expect(caravan.breedName).toBe('Angus');
    expect(caravan.breedPosition).toBe(1);
  });
});
