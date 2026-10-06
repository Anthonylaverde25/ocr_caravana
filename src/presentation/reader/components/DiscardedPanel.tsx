import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { DiscardedReading } from '../../../core/entities/RegistrationSession';
import { colors, common } from '../theme';

/** Bad reads are never hidden: the operator sees the raw text and can re-read the animal. */
export function DiscardedPanel({ discarded }: { discarded: DiscardedReading[] }) {
  const [open, setOpen] = useState(false);
  if (discarded.length === 0) return null;

  return (
    <View style={[common.card, styles.card]}>
      <TouchableOpacity style={[common.row, { justifyContent: 'space-between' }]} onPress={() => setOpen(!open)}>
        <View style={common.row}>
          <AlertTriangle size={16} color={colors.warning} />
          <Text style={styles.title}>{discarded.length} lectura(s) descartada(s)</Text>
        </View>
        {open ? <ChevronUp size={18} color={colors.muted} /> : <ChevronDown size={18} color={colors.muted} />}
      </TouchableOpacity>
      {open && discarded.slice(0, 50).map((d, i) => (
        <View key={`${d.at}-${i}`} style={styles.item}>
          <Text style={styles.raw}>{JSON.stringify(d.raw)}</Text>
          <Text style={common.muted}>{d.reason} · {new Date(d.at).toLocaleTimeString()}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.warningBg },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  item: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 6 },
  raw: { fontFamily: 'Menlo', fontSize: 13, color: colors.text },
});
