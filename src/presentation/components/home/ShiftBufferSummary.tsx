import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../../reader/theme';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';

interface ShiftBufferSummaryProps {
  totalCount: number;
  pendingCount: number;
  onOpenHistory: () => void;
}

export function ShiftBufferSummary({ totalCount, pendingCount, onOpenHistory }: ShiftBufferSummaryProps) {
  const isAllSynced = pendingCount === 0;

  return (
    <View style={styles.container}>
      <SectionHeader title="Buffer local" actionLabel="Ver historial" onAction={onOpenHistory} />

      <TouchableOpacity onPress={onOpenHistory} activeOpacity={0.8}>
        <Card style={styles.bar} padding={16}>
          <View style={styles.stat}>
            <Text style={styles.label}>En el teléfono</Text>
            <Text style={styles.value}>{totalCount}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.label}>Por sincronizar</Text>
            <Text style={[styles.value, !isAllSynced && styles.valueWarning]}>{pendingCount}</Text>
          </View>
          <StatusPill label={isAllSynced ? 'Al día' : 'Pendiente'} tone={isAllSynced ? 'success' : 'warning'} />
        </Card>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stat: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  value: { fontFamily: fonts.semibold, fontSize: 20, color: colors.text },
  valueWarning: { color: colors.warning },
});
