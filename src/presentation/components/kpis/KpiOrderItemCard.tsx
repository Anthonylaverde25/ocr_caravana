import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Layers, Building2 } from 'lucide-react-native';
import { KpiOrderItem } from '../../../infrastructure/api/OperationalKpiApi';

interface KpiOrderItemCardProps {
  item: KpiOrderItem;
}

export function KpiOrderItemCard({ item }: KpiOrderItemCardProps) {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
      case 'ISSUED':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'AWAITING_DTE':
      case 'PARTIAL':
        return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
      case 'DRAFT':
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
    }
  };

  const badgeStyle = getStatusBadgeStyle(item.status);

  return (
    <View style={styles.orderCard}>
      {/* Top Row: Code & Status */}
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderCode}>{item.code}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: badgeStyle.bg,
              borderColor: badgeStyle.border,
            },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
            {item.status_label}
          </Text>
        </View>
      </View>

      {/* Middle Row: Heads & Date */}
      <View style={styles.orderCardBody}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Hacienda:</Text>
          <Text style={styles.metaValueHighlight}>{item.planned_heads} cabezas</Text>
        </View>

        {item.date && (
          <View style={styles.metaRow}>
            <Calendar size={13} color="#6B7280" />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
        )}
      </View>

      {/* Extra Details */}
      {(item.batch_name || item.source_batch_name || item.provider_name || item.period_end || item.weaning_type) && (
        <View style={styles.orderCardFooter}>
          {(item.batch_name || item.source_batch_name) && (
            <View style={styles.detailItem}>
              <Layers size={12} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.batch_name || item.source_batch_name}
              </Text>
            </View>
          )}

          {item.provider_name && (
            <View style={styles.detailItem}>
              <Building2 size={12} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.provider_name}
              </Text>
            </View>
          )}

          {item.period_end && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>Fin período: {item.period_end}</Text>
            </View>
          )}

          {item.weaning_type && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>Tipo: {item.weaning_type}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  metaValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderCardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 11,
    color: '#4B5563',
  },
});
