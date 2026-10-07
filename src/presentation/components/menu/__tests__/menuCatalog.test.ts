import {
  ALL_MENU_ITEMS,
  MENU_CATEGORIES,
  QUICK_ACTIONS,
} from '../menuCatalog';

describe('menuCatalog', () => {
  it('contains valid categories with unique keys', () => {
    const keys = MENU_CATEGORIES.map((c) => c.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
    expect(keys).toContain('OPERACIONES');
    expect(keys).toContain('LOGISTICA');
  });

  it('all menu items have unique IDs and belong to existing categories', () => {
    const ids = ALL_MENU_ITEMS.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(ids).toContain('operaciones');
    expect(ids).toContain('dte');

    const validCategoryKeys = new Set(MENU_CATEGORIES.map((c) => c.key));
    ALL_MENU_ITEMS.forEach((item) => {
      expect(validCategoryKeys.has(item.category)).toBe(true);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.iconBg.length).toBeGreaterThan(0);
    });
  });

  it('menu items define valid target routes for operations and dte', () => {
    const availableItems = ALL_MENU_ITEMS.filter((i) => i.available);
    expect(availableItems.length).toBe(2);

    const routes = availableItems.map((item) => item.targetRoute);
    expect(routes).toContain('OperationsScreen');
    expect(routes).toContain('DteScreen');
  });

  it('quick actions define valid target tabs and unique IDs', () => {
    const ids = QUICK_ACTIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);

    QUICK_ACTIONS.forEach((action) => {
      expect(['Lector', 'Planillas', 'Historial']).toContain(action.targetTab);
      expect(action.title.length).toBeGreaterThan(0);
    });
  });
});
