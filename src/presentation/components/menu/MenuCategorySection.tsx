import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MenuCategoryMeta, MenuItem } from './menuCatalog';
import { MenuModuleCard } from './MenuModuleCard';

export interface MenuCategorySectionProps {
  category: MenuCategoryMeta;
  items: MenuItem[];
  onSelectModule: (item: MenuItem) => void;
}

export function MenuCategorySection({
  category,
  items,
  onSelectModule,
}: MenuCategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{category.label.toUpperCase()}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <MenuModuleCard
            key={item.id}
            item={item}
            onPress={onSelectModule}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    gap: 10,
  },
  header: {
    gap: 2,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.8,
  },
  categoryDescription: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
