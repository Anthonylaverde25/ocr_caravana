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
      style={[styles.rowItem, isLast ? styles.rowItemLast : styles.rowItemBorder]}
      activeOpacity={0.65}
      onPress={() => onPress(category)}
    >
      {/* Leading Visual */}
      <View style={[styles.leadingIconBox, { backgroundColor: `${category.color}15` }]}>
        {renderIcon(category.key, category.color)}
      </View>

      {/* Center Content */}
      <View style={styles.cellContent}>
        <View style={styles.titleRow}>
          <Text style={styles.cellTitle} numberOfLines={1}>
            {category.title}
          </Text>
          <View style={[styles.templateTag, { backgroundColor: `${category.color}18` }]}>
            <Text style={[styles.templateTagText, { color: category.color }]}>
              {category.template_code}
            </Text>
          </View>
        </View>

        <Text style={styles.cellSubtitle} numberOfLines={1}>
          {category.subtitle}
        </Text>

        <Text style={styles.cellBreakdown} numberOfLines={1}>
          {breakdownText}
        </Text>
      </View>

      {/* Trailing Metrics */}
      <View style={styles.trailingContainer}>
        <View style={styles.metricsColumn}>
          <View style={styles.pendingCountRow}>
            <Text
              style={[
                styles.pendingNumber,
                { color: category.total_pending > 0 ? category.color : '#9CA3AF' },
              ]}
            >
              {category.total_pending}
            </Text>
            <Text style={styles.pendingLabel}>docs</Text>
          </View>
          <Text style={styles.headsNumber}>{category.total_planned_heads} cab.</Text>
        </View>

        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 2,
    gap: 12,
  },
  rowItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowItemLast: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  leadingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellContent: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cellTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  templateTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  cellSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  cellBreakdown: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '500',
    marginTop: 1,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricsColumn: {
    alignItems: 'flex-end',
    gap: 1,
  },
  pendingCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  pendingNumber: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 21,
  },
  pendingLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  headsNumber: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
});
