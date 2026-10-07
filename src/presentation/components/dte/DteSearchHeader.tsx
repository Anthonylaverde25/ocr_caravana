import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../../reader/theme';
import { FilterChips } from '../ui/FilterChips';
import { SearchBar } from '../ui/SearchBar';
import { DTE_FILTERS, DteFilterStatus } from './dteItems';

interface DteSearchHeaderProps {
  metrics: { label: string; value: number }[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: DteFilterStatus;
  onFilterChange: (filter: DteFilterStatus) => void;
}

/** Metrics as glass tiles on the green (design ref image3.png), search below them, filters on the page. */
export function DteSearchHeader({ metrics, searchQuery, onSearchChange, filter, onFilterChange }: DteSearchHeaderProps) {
  return (
    <View>
      <View style={styles.green}>
        <View style={styles.tiles}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.tile}>
              <Text style={styles.tileLabel} numberOfLines={1}>{metric.label}</Text>
              <Text style={styles.tileValue}>{metric.value}</Text>
            </View>
          ))}
        </View>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Buscar DTe, orden o proveedor…" />
      </View>
      <FilterChips options={DTE_FILTERS} value={filter} onChange={onFilterChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  green: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 14,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.onPrimaryGlass,
    borderWidth: 1,
    borderColor: colors.onPrimaryGlassBorder,
  },
  tileLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onPrimaryMuted },
  tileValue: { fontFamily: fonts.semibold, fontSize: 22, color: colors.onPrimary },
});
