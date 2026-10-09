import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRightLeft, Scale } from 'lucide-react-native';
import { AnimalRecord, MovementEntry, WeightEntry, gainSinceEntry, movementLabel, weightHistory } from '../../../core/caravans/AnimalRecord';
import { colors, fonts, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';
import { formatChange, formatDay, formatKg } from './format';

const SHOWN = 3;

interface Props {
  record: AnimalRecord;
  weights: WeightEntry[];
  movements: MovementEntry[];
}

/** The latest weighings and movements: enough to judge the animal without leaving the chute. */
export function RecordHistory({ record, weights, movements }: Props) {
  const gain = gainSinceEntry(record);

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.head}>
          <Text style={styles.title}>Pesadas</Text>
          {gain !== null && <StatusPill label={`${formatChange(gain)} desde el ingreso`} tone={gain >= 0 ? 'success' : 'warning'} />}
        </View>
        {weights.length === 0 ? (
          <Text style={styles.empty}>Sin pesadas registradas.</Text>
        ) : (
          weightHistory(weights).slice(0, SHOWN).map((w, i, list) => (
            <View key={`${w.date}-${i}`} style={[styles.row, i < list.length - 1 && styles.rowBorder]}>
              <View style={styles.icon}><Scale size={18} color={colors.primary} /></View>
              <Text style={styles.rowTitle}>{formatDay(w.date)}</Text>
              <View style={styles.right}>
                <Text style={styles.value}>{formatKg(w.weight)}</Text>
                {w.change !== null && <Text style={[styles.change, w.change < 0 && styles.loss]}>{formatChange(w.change)}</Text>}
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Últimos movimientos</Text>
        {movements.length === 0 ? (
          <Text style={styles.empty}>Sin movimientos registrados.</Text>
        ) : (
          movements.slice(0, SHOWN).map((m, i, list) => (
            <View key={`${m.date}-${i}`} style={[styles.row, i < list.length - 1 && styles.rowBorder]}>
              <View style={styles.icon}><ArrowRightLeft size={18} color={colors.primary} /></View>
              <View style={styles.body}>
                <Text style={styles.rowTitle}>{movementLabel(m.type)}</Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {[m.observations, formatDay(m.date)].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginBottom: 4 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  icon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  rowTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  right: { alignItems: 'flex-end' },
  value: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  change: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
  loss: { color: colors.warningText },
});
