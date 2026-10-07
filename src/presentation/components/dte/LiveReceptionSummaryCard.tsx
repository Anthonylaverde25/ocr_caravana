import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../../reader/theme';

export interface LiveReceptionSummaryCardProps {
  /** Arrived heads declared from truck count (or expected if identify mode). */
  receivedCount: number;
  /** Count of identified animals with ear tags. */
  caravansCount: number;
  /** Heads without ear tag identification yet (receivedCount - caravansCount). */
  withoutCaravansCount: number;
  /** Number of caravans with missing required data (in mixed troops). */
  incompleteCount: number;
}

/**
 * Real-time reception summary strip: displays live reconciliations of arrived heads,
 * ear tags read, animals without ear tag pending identification, and incomplete records.
 */
export const LiveReceptionSummaryCard: React.FC<LiveReceptionSummaryCardProps> = ({
  receivedCount,
  caravansCount,
  withoutCaravansCount,
  incompleteCount,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resumen de recepción</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricNumber}>{receivedCount}</Text>
          <Text style={styles.metricLabel}>Recibidas</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricNumber, caravansCount > 0 && styles.metricSuccess]}>
            {caravansCount}
          </Text>
          <Text style={styles.metricLabel}>Con caravana</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricNumber, withoutCaravansCount > 0 && styles.metricWarning]}>
            {withoutCaravansCount}
          </Text>
          <Text style={styles.metricLabel}>Sin caravana</Text>
        </View>

        {incompleteCount > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, styles.metricDanger]}>
                {incompleteCount}
              </Text>
              <Text style={styles.metricLabel}>Incompletas</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
    ...shadow.card,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  metricSuccess: {
    color: colors.primaryDark,
  },
  metricWarning: {
    color: colors.warning,
  },
  metricDanger: {
    color: colors.danger,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
});
