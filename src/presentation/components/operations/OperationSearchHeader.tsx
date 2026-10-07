import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OperationCategory, OPERATION_CATEGORIES } from './operationsCatalog';
import { colors, radius } from '../../reader/theme';
import { FilterChips } from '../ui/FilterChips';
import { SearchBar } from '../ui/SearchBar';

interface OperationSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: OperationCategory;
  onCategorySelect: (category: OperationCategory) => void;
}

const LABELS: Record<OperationCategory, string> = {
  TODAS: 'Todas',
  MANGA: 'Manga',
  REPRODUCCIÓN: 'Reproducción',
  SANIDAD: 'Sanidad',
  LOGÍSTICA: 'Logística',
};

export function categoryLabel(category: OperationCategory): string {
  return LABELS[category];
}

/** Search sits on the green, under an `extended` AppHeader (design ref image.png); chips below it. */
export function OperationSearchHeader({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
}: OperationSearchHeaderProps) {
  return (
    <View>
      <View style={styles.green}>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Buscar operación…" />
      </View>
      <FilterChips
        options={OPERATION_CATEGORIES.map((c) => ({ value: c, label: LABELS[c] }))}
        value={selectedCategory}
        onChange={onCategorySelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  green: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
});
