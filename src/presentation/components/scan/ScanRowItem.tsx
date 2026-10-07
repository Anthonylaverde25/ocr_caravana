import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';
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
              <AlertTriangle size={11} color={colors.warningText} />
            ) : (
              <CheckCircle2 size={11} color={colors.primary} />
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
            <Edit2 size={15} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={15} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Warning message if any */}
      {row.warningMessage && (
        <View style={styles.warningBox}>
          <AlertTriangle size={12} color={colors.warningText} />
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningBg,
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
    fontFamily: fonts.semibold,
    color: colors.subtle,
  },
  caravanaText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text, fontVariant: ['tabular-nums'],
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
    backgroundColor: colors.primaryBg,
  },
  confidenceLow: {
    backgroundColor: colors.warningBg,
  },
  confidenceText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
  },
  confidenceTextHigh: {
    color: colors.primary,
  },
  confidenceTextLow: {
    color: colors.warningText,
  },
  iconBtn: {
    padding: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    padding: 6,
    borderRadius: radius.sm,
    gap: 6,
  },
  warningMessageText: {
    fontSize: 11,
    color: colors.warningText,
    fontFamily: fonts.medium,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  weightBadge: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
  },
  weightText: {
    fontSize: 11,
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
  ceBadge: {
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBg,
  },
  ceText: {
    fontSize: 11,
    color: colors.info,
    fontFamily: fonts.semibold,
  },
  verdictGood: {
    backgroundColor: colors.primaryBg,
  },
  verdictBad: {
    backgroundColor: colors.dangerBg,
  },
  verdictText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },
  obsText: {
    fontFamily: fonts.regular, fontSize: 11,
    color: colors.muted,
    fontStyle: 'italic',
  },
});
