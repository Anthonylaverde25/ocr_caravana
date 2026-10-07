import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RegistrationSession, LookupStatus } from '../../../core/entities/RegistrationSession';
import { colors, fonts } from '../../reader/theme';

const METRICS: { status: LookupStatus; label: string }[] = [
  { status: 'not_found', label: 'Nuevas' },
  { status: 'own_company', label: 'Registradas' },
  { status: 'other_company', label: 'Otra empresa' },
  { status: 'unchecked', label: 'Sin verificar' },
];

/** Breakdown of the session readings by lookup result (design ref: humidity / pressure row). */
export function SessionMetricsRow({ session }: { session: RegistrationSession }) {
  const counts = session.readings.reduce<Record<string, number>>((acc, reading) => {
    const status = session.lookup[reading.eid] ?? 'unchecked';
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.row}>
      {METRICS.map(({ status, label }) => (
        <View key={status} style={styles.cell}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[styles.value, status === 'not_found' && styles.valueAccent]}>{counts[status] ?? 0}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cell: { gap: 2, flexShrink: 1 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  value: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  valueAccent: { color: colors.primary },
});
