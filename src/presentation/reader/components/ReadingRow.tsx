import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LookupStatus, TagReading } from '../../../core/entities/RegistrationSession';
import { colors, fonts, formatEid, radius, shadow } from '../theme';
import { StatusChip } from './StatusChip';

interface Props {
  reading: TagReading;
  status: LookupStatus;
  index: number;
  /** The newest reading: shown bigger so it can be checked from a step away. */
  latest?: boolean;
}

export function ReadingRow({ reading, status, index, latest }: Props) {
  return (
    <View style={[styles.row, latest && styles.rowLatest]}>
      <View style={[styles.indexBadge, latest && styles.indexBadgeLatest]}>
        <Text style={[styles.index, latest && styles.indexLatest]}>{index}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.eid, latest && styles.eidLatest]}>{formatEid(reading.eid)}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  rowLatest: { borderColor: colors.emeraldBorder, paddingVertical: 16, ...shadow.card },
  indexBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 6,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadgeLatest: { backgroundColor: colors.primary },
  index: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  indexLatest: { color: colors.onPrimary },
  body: { flex: 1, gap: 2 },
  eid: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text, fontVariant: ['tabular-nums'] },
  eidLatest: { fontSize: 21 },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
