import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { RecentLookup } from '../../caravan/useCaravanLookup';
import { colors, fonts, formatEid, radius, shadow } from '../../reader/theme';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { formatTime } from './format';

interface Props {
  items: RecentLookup[];
  onOpen: (eid: string) => void;
  onClear: () => void;
}

export function RecentLookups({ items, onOpen, onClear }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Consultadas hoy" actionLabel="Limpiar" onAction={onClear} />
      <View style={styles.list}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.eid}
            style={[styles.row, index < items.length - 1 && styles.rowBorder]}
            onPress={() => onOpen(item.eid)}
            activeOpacity={0.65}
          >
            <View style={styles.body}>
              <Text style={styles.eid}>{formatEid(item.eid)}</Text>
              <Text style={styles.summary} numberOfLines={1}>{item.summary} · {formatTime(item.at)}</Text>
            </View>
            <StatusPill label={item.label} tone={item.tone} />
            <ChevronRight size={16} color={colors.subtle} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 14, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  body: { flex: 1, gap: 2 },
  eid: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] },
  summary: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
