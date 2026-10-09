import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../reader/theme';
import { Card } from '../ui/Card';

export interface Fact {
  label: string;
  value: string | null;
  hint?: string | null;
  /** Caravan numbers line their digits up. */
  numeric?: boolean;
}

/** A titled card of label / value pairs, two per row. Unknown values show as a dash, never hidden. */
export function FactGrid({ title, facts, accessory }: { title: string; facts: Fact[]; accessory?: React.ReactNode }) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        {accessory}
      </View>
      <View style={styles.grid}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.cell}>
            <Text style={styles.label}>{fact.label}</Text>
            <Text style={[styles.value, fact.numeric && styles.numeric]}>{fact.value ?? '—'}</Text>
            {fact.hint ? <Text style={styles.hint}>{fact.hint}</Text> : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  cell: { width: '50%', paddingRight: 12, gap: 1 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  value: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  numeric: { fontVariant: ['tabular-nums'] },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
