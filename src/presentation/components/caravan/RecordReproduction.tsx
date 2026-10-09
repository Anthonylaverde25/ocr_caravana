import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimalRecord, gestationProgress, gestationStageLabel } from '../../../core/caravans/AnimalRecord';
import { colors, fonts, formatEid, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';
import { formatDay } from './format';

/** Females only: physiological state and, while pregnant, how far along and by which bulls. */
export function RecordReproduction({ record }: { record: AnimalRecord }) {
  const { physiological, gestation } = record;
  if (!physiological) return null;

  const months = gestation?.months ?? null;

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Estado reproductivo</Text>
        <StatusPill label={physiological.isPregnant ? 'Preñada' : 'Vacía'} tone={physiological.isPregnant ? 'success' : 'neutral'} />
      </View>
      <Text style={styles.state}>{physiological.label}</Text>

      {gestation && (
        <>
          <View style={styles.grid}>
            <View style={styles.cell}>
              <Text style={styles.label}>Etapa</Text>
              <Text style={styles.value}>{gestationStageLabel(gestation.stage) ?? '—'}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.label}>Parto estimado</Text>
              <Text style={styles.value}>{formatDay(gestation.estimatedDueDate) ?? '—'}</Text>
            </View>
          </View>
          {months !== null && (
            <View style={styles.progress}>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${gestationProgress(months) * 100}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.hint}>{months.toLocaleString('es-AR', { maximumFractionDigits: 1 })} meses de gestación</Text>
                <Text style={styles.hint}>9 meses</Text>
              </View>
            </View>
          )}
          {gestation.sires.length > 0 && (
            <>
              <Text style={styles.hint}>Toros posibles</Text>
              {gestation.sires.map((sire) => (
                <View key={sire.identification} style={styles.sire}>
                  <Text style={styles.sireEid}>{formatEid(sire.identification)}</Text>
                  <StatusPill label={sire.confirmed ? 'Confirmado' : 'Posible'} tone={sire.confirmed ? 'success' : 'neutral'} />
                </View>
              ))}
            </>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  state: { fontFamily: fonts.medium, fontSize: 15, color: colors.textSecondary },
  grid: { flexDirection: 'row' },
  cell: { flex: 1, gap: 1 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  value: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  progress: { gap: 6 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.borderSubtle, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  sire: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  sireEid: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text, fontVariant: ['tabular-nums'] },
});
