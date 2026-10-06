import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import { colors } from '../../../reader/theme';
import type { SheetModule, SheetRow } from '../../../../core/work-templates/sheet/types';
import type { RowIssues } from '../../../scan/useSheetReview';
import { ReviewIssueList } from './ReviewIssueList';

interface ReviewRowCardProps {
  module: SheetModule;
  row: SheetRow;
  index: number;
  issues: RowIssues | undefined;
  /** The row is not sent: nothing written on it. */
  skipped: boolean;
  locked: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** One row of the sheet: what was read, field by field, and what the server says about it. */
export function ReviewRowCard({ module, row, index, issues, skipped, locked, onEdit, onDelete }: ReviewRowCardProps) {
  const hasErrors = (issues?.errors.length ?? 0) > 0;
  const hasWarnings = (issues?.warnings.length ?? 0) > 0;
  const title = row.values[module.rowTitleKey] || '(sin caravana)';
  const details = module.rowFields.filter((f) => f.key !== module.rowTitleKey && (row.values[f.key] ?? '') !== '');
  const status = skipped ? 'No se envía' : hasErrors ? 'A corregir' : hasWarnings ? 'Con aviso' : 'Bien';

  return (
    <View style={[styles.card, hasErrors && styles.cardError, !hasErrors && hasWarnings && styles.cardWarning]}>
      <View style={styles.top}>
        <Text style={styles.index}>#{index + 1}</Text>
        <Text style={styles.title}>{title}</Text>
        {row.pageNumber !== null ? <Text style={styles.page}>Hoja {row.pageNumber}</Text> : null}
        <Text style={[styles.status, hasErrors ? styles.statusError : hasWarnings ? styles.statusWarning : styles.statusOk]}>{status}</Text>
        {!locked && (
          <>
            <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.icon}>
              <Edit2 size={15} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.icon}>
              <Trash2 size={15} color={colors.danger} />
            </TouchableOpacity>
          </>
        )}
      </View>
      {details.length > 0 && (
        <View style={styles.details}>
          {details.map((f) => (
            <Text key={f.key} style={styles.detail}>
              <Text style={styles.detailLabel}>{f.label}: </Text>
              {f.options?.find((o) => o.value === row.values[f.key])?.label ?? row.values[f.key]}
            </Text>
          ))}
        </View>
      )}
      <ReviewIssueList errors={issues?.errors ?? []} warnings={issues?.warnings ?? []} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: colors.border },
  cardError: { borderColor: '#FCA5A5' },
  cardWarning: { borderColor: '#FCD34D' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  index: { fontSize: 12, fontWeight: '700', color: colors.muted },
  title: { flex: 1, fontSize: 15, fontWeight: '800', fontFamily: 'monospace', color: colors.text },
  page: { fontSize: 11, color: colors.muted },
  status: { fontSize: 11, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  statusOk: { color: colors.primaryDark, backgroundColor: colors.primaryBg },
  statusWarning: { color: '#92400E', backgroundColor: colors.warningBg },
  statusError: { color: '#B91C1C', backgroundColor: colors.dangerBg },
  icon: { padding: 2 },
  details: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2 },
  detail: { fontSize: 12, color: colors.text },
  detailLabel: { color: colors.muted },
});
