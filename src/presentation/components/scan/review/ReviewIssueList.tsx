import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, XCircle } from 'lucide-react-native';
import { colors } from '../../../reader/theme';
import type { ReviewIssue } from '../../../../core/work-templates/sheet/feedback';

interface ReviewIssueListProps {
  errors: ReviewIssue[];
  warnings: ReviewIssue[];
  compact?: boolean;
}

/** What the server said: errors block registering, warnings only ask to check. */
export function ReviewIssueList({ errors, warnings, compact = false }: ReviewIssueListProps) {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <View style={[styles.list, compact && styles.compact]}>
      {errors.map((issue, i) => (
        <View key={`e-${i}`} style={[styles.item, styles.error]}>
          <XCircle size={13} color={colors.danger} />
          <Text style={[styles.text, styles.errorText]}>{issue.message}</Text>
        </View>
      ))}
      {warnings.map((issue, i) => (
        <View key={`w-${i}`} style={[styles.item, styles.warning]}>
          <AlertTriangle size={13} color="#B45309" />
          <Text style={[styles.text, styles.warningText]}>{issue.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  compact: { gap: 4 },
  item: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  error: { backgroundColor: colors.dangerBg },
  warning: { backgroundColor: colors.warningBg },
  text: { flex: 1, fontSize: 12, lineHeight: 16 },
  errorText: { color: '#B91C1C' },
  warningText: { color: '#92400E' },
});
