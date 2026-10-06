import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../reader/theme';
import { WorkTemplateScanRow } from '../../../core/work-templates/types';

interface ScanRowItemProps {
  row: WorkTemplateScanRow;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ScanRowItem({ row, index, onEdit, onDelete }: ScanRowItemProps) {
  const confidencePercent = Math.round(row.confidence * 100);
  const isLowConfidence = row.confidence < 0.8;
  const hasAlert = row.hasWarning || isLowConfidence;

  return (
    <View style={[styles.card, hasAlert && styles.cardWarning]}>
      <View style={styles.topRow}>
        <View style={styles.caravanaWrap}>
          <Text style={styles.indexNum}>#{index + 1}</Text>
          <Text style={styles.caravanaText}>{row.caravana}</Text>
        </View>

        <View style={styles.badgesWrap}>
          <View
            style={[
              styles.confidenceBadge,
              isLowConfidence ? styles.confidenceLow : styles.confidenceHigh,
            ]}
          >
            {isLowConfidence ? (
              <AlertTriangle size={11} color="#B45309" />
            ) : (
              <CheckCircle2 size={11} color="#047857" />
            )}
            <Text
              style={[
                styles.confidenceText,
                isLowConfidence ? styles.confidenceTextLow : styles.confidenceTextHigh,
              ]}
            >
              {confidencePercent}%
            </Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Edit2 size={15} color="#4B5563" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={15} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Warning message if any */}
      {row.warningMessage && (
        <View style={styles.warningBox}>
          <AlertTriangle size={12} color="#B45309" />
          <Text style={styles.warningMessageText}>{row.warningMessage}</Text>
        </View>
      )}

      {/* Row details grid */}
      <View style={styles.detailsRow}>
        {row.category ? (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{row.category}</Text>
          </View>
        ) : null}

        {row.breed ? (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{row.breed}</Text>
          </View>
        ) : null}

        {row.sex ? (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{row.sex === 'M' ? 'Macho' : 'Hembra'}</Text>
          </View>
        ) : null}

        {row.entry_weight !== undefined && row.entry_weight !== '' && row.entry_weight !== null ? (
          <View style={[styles.tagBadge, styles.weightBadge]}>
            <Text style={styles.weightText}>{row.entry_weight} kg</Text>
          </View>
        ) : null}

        {row.ce_cm ? (
          <View style={[styles.tagBadge, styles.ceBadge]}>
            <Text style={styles.ceText}>CE: {row.ce_cm} cm</Text>
          </View>
        ) : null}

        {row.physical_verdict ? (
          <View style={[styles.tagBadge, row.physical_verdict.includes('No') ? styles.verdictBad : styles.verdictGood]}>
            <Text style={styles.verdictText}>{row.physical_verdict}</Text>
          </View>
        ) : null}
      </View>

      {row.observations ? (
        <Text style={styles.obsText} numberOfLines={2}>
          Obs: {row.observations}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  cardWarning: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFDF5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caravanaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  caravanaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'monospace',
  },
  badgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  confidenceHigh: {
    backgroundColor: '#ECFDF5',
  },
  confidenceLow: {
    backgroundColor: '#FEF3C7',
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
  },
  confidenceTextHigh: {
    color: '#047857',
  },
  confidenceTextLow: {
    color: '#B45309',
  },
  iconBtn: {
    padding: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 6,
    gap: 6,
  },
  warningMessageText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  weightBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  weightText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
  },
  ceBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  ceText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  verdictGood: {
    backgroundColor: '#ECFDF5',
  },
  verdictBad: {
    backgroundColor: '#FEE2E2',
  },
  verdictText: {
    fontSize: 11,
    fontWeight: '700',
  },
  obsText: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: 'italic',
  },
});
