import React from 'react';
import { StyleSheet } from 'react-native';
import { KpiCategoryData, OperationalKpis } from '../../infrastructure/api/OperationalKpiApi';
import { FioriObjectCell } from './kpis/FioriObjectCell';
import { Card } from './ui/Card';

interface FioriPendingDocsListProps {
  kpis: OperationalKpis;
  onSelectCategory: (category: KpiCategoryData) => void;
}

export function FioriPendingDocsList({ kpis, onSelectCategory }: FioriPendingDocsListProps) {
  const categoriesList: KpiCategoryData[] = [
    kpis.categories.entry_orders,
    kpis.categories.birth_orders,
    kpis.categories.transfer_orders,
    kpis.categories.weaning_orders,
  ].filter(Boolean);

  return (
    <Card padding={0} style={styles.card}>
      {categoriesList.map((cat, index) => (
        <FioriObjectCell
          key={cat.key}
          category={cat}
          isLast={index === categoriesList.length - 1}
          onPress={onSelectCategory}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 14, overflow: 'hidden' },
});
