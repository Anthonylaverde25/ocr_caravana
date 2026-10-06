import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LookupStatus, TagReading } from '../../../core/entities/RegistrationSession';
import { colors, formatEid } from '../theme';
import { StatusChip } from './StatusChip';

export function ReadingRow({ reading, status, index }: { reading: TagReading; status: LookupStatus; index: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.index}>{index}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.eid}>{formatEid(reading.eid)}</Text>
        <Text style={styles.meta}>
          {new Date(reading.lastReadAt).toLocaleTimeString()}
          {reading.readCount > 1 ? ` · leída ${reading.readCount} veces` : ''}
          {reading.warning ? ` · ${reading.warning}` : ''}
        </Text>
      </View>
      <StatusChip status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10,
  },
  index: { width: 28, fontSize: 13, color: colors.muted, textAlign: 'right' },
  eid: { fontSize: 18, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  meta: { fontSize: 12, color: colors.muted },
});
