import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Truck,
  Baby,
  ArrowRightLeft,
  Milk,
  ChevronRight,
  Layers,
} from 'lucide-react-native';
import { KpiCategoryData } from '../../../infrastructure/api/OperationalKpiApi';
import { colors, fonts, radius } from '../../reader/theme';

interface FioriObjectCellProps {
  category: KpiCategoryData;
  isLast: boolean;
  onPress: (category: KpiCategoryData) => void;
}

export function FioriObjectCell({ category, isLast, onPress }: FioriObjectCellProps) {
  const renderIcon = (key: string, color: string) => {
    switch (key) {
      case 'entry_orders':
        return <Truck size={20} color={color} />;
      case 'birth_orders':
        return <Baby size={20} color={color} />;
      case 'transfer_orders':
        return <ArrowRightLeft size={20} color={color} />;
      case 'weaning_orders':
        return <Milk size={20} color={color} />;
      default:
        return <Layers size={20} color={color} />;
    }
  };

  const getBreakdownSummary = (cat: KpiCategoryData) => {
    if (cat.key === 'entry_orders') {
      const parts: string[] = [];
      if (cat.breakdown.in_transit) parts.push(`${cat.breakdown.in_transit} en tránsito`);
      if (cat.breakdown.awaiting_dte) parts.push(`${cat.breakdown.awaiting_dte} espera DTE`);
      if (cat.breakdown.draft) parts.push(`${cat.breakdown.draft} borrador`);
      return parts.length > 0 ? parts.join(' • ') : 'Al día';
    }

    const parts: string[] = [];
    if (cat.breakdown.issued) parts.push(`${cat.breakdown.issued} emitidas`);
    if (cat.breakdown.partial) parts.push(`${cat.breakdown.partial} parciales`);
    if (cat.breakdown.draft) parts.push(`${cat.breakdown.draft} borrador`);
    return parts.length > 0 ? parts.join(' • ') : 'Al día';
  };

  const breakdownText = getBreakdownSummary(category);

  return (
    <TouchableOpacity
      style={[styles.rowItem, !isLast && styles.rowItemBorder]}
      activeOpacity={0.65}
      onPress={() => onPress(category)}
    >
      <View style={[styles.leadingIconBox, { backgroundColor: `${category.color}15` }]}>
        {renderIcon(category.key, category.color)}
      </View>

      <View style={styles.cellContent}>
        <View style={styles.titleRow}>
          <Text style={styles.cellTitle} numberOfLines={1}>
            {category.title}
          </Text>
          <Text style={styles.templateCode}>{category.template_code}</Text>
        </View>
        <Text style={styles.cellBreakdown} numberOfLines={1}>
          {breakdownText}
        </Text>
      </View>

      <View style={styles.trailingContainer}>
        <View style={styles.metricsColumn}>
          <Text
            style={[
              styles.pendingNumber,
              { color: category.total_pending > 0 ? colors.text : colors.subtle },
            ]}
          >
            {category.total_pending}
            <Text style={styles.pendingLabel}> docs</Text>
          </Text>
          <Text style={styles.headsNumber}>{category.total_planned_heads} cab.</Text>
        </View>
        <ChevronRight size={18} color={colors.subtle} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  leadingIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellContent: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  cellTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, flexShrink: 1 },
  templateCode: { fontFamily: fonts.medium, fontSize: 11, color: colors.subtle },
  cellBreakdown: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  trailingContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricsColumn: { alignItems: 'flex-end', gap: 1 },
  pendingNumber: { fontFamily: fonts.semibold, fontSize: 18 },
  pendingLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  headsNumber: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
