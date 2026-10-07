import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Layers, Building2 } from 'lucide-react-native';
import { KpiOrderItem } from '../../../infrastructure/api/OperationalKpiApi';
import { colors, fonts, radius } from '../../reader/theme';

interface KpiOrderItemCardProps {
  item: KpiOrderItem;
}

export function KpiOrderItemCard({ item }: KpiOrderItemCardProps) {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
      case 'ISSUED':
        return { bg: colors.primaryBg, text: colors.primary, border: colors.emeraldBorder };
      case 'AWAITING_DTE':
      case 'PARTIAL':
        return { bg: colors.warningBg, text: colors.warningText, border: colors.warningBg };
      case 'DRAFT':
        return { bg: colors.surfaceMuted, text: colors.textSecondary, border: colors.border };
      default:
        return { bg: colors.infoBg, text: colors.info, border: colors.infoBg };
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
            <Calendar size={13} color={colors.muted} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
        )}
      </View>

      {/* Extra Details */}
      {(item.batch_name || item.source_batch_name || item.provider_name || item.period_end || item.weaning_type) && (
        <View style={styles.orderCardFooter}>
          {(item.batch_name || item.source_batch_name) && (
            <View style={styles.detailItem}>
              <Layers size={12} color={colors.muted} />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.batch_name || item.source_batch_name}
              </Text>
            </View>
          )}

          {item.provider_name && (
            <View style={styles.detailItem}>
              <Building2 size={12} color={colors.muted} />
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
    shadowColor: colors.text,
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
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: fonts.medium,
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
    fontFamily: fonts.regular, fontSize: 13,
    color: colors.muted,
  },
  metaValueHighlight: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  metaText: {
    fontFamily: fonts.regular, fontSize: 12,
    color: colors.muted,
  },
  orderCardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontFamily: fonts.regular, fontSize: 11,
    color: colors.textSecondary,
  },
});
