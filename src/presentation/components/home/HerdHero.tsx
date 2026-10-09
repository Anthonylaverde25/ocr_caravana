import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Beef, Clock } from 'lucide-react-native';
import { HerdSummary } from '../../../infrastructure/api/HerdSummaryApi';
import { colors, fonts, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';

interface Props {
  summary: HerdSummary | null;
  loading: boolean;
  fromCache: boolean;
  companyName: string;
}

/** 1240 → "1.240". Built by hand: Intl support differs between Hermes builds. */
function thousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function time(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** The herd's head count: what the establishment is, before what is being done today. */
export function HerdHero({ summary, loading, fromCache, companyName }: Props) {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Beef size={16} color={colors.primary} />
        </View>
        <Text style={styles.eyebrow}>Mi rodeo</Text>
        {fromCache && <StatusPill label="Caché local" tone="warning" />}
      </View>

      <View style={styles.countRow}>
        {loading && !summary ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <Text style={styles.count}>{summary ? thousands(summary.total) : '—'}</Text>
        )}
        <View style={styles.caption}>
          <Text style={styles.unit}>{summary?.total === 1 ? 'cabeza' : 'cabezas'}</Text>
          <Text style={styles.hint} numberOfLines={1}>
            Animales propios de {companyName}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Clock size={13} color={colors.muted} />
        <Text style={styles.hint}>
          {summary
            ? `Actualizado ${time(summary.updatedAt)}${fromCache ? ' · sin conexión' : ''}`
            : loading
            ? 'Contando el rodeo…'
            : 'Sin conexión: el total aparece cuando haya señal.'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, borderRadius: radius.xl },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  countRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  count: { fontFamily: fonts.semibold, fontSize: 56, lineHeight: 60, color: colors.text, fontVariant: ['tabular-nums'] },
  loader: { height: 60, width: 60 },
  caption: { flex: 1, paddingBottom: 8, gap: 1 },
  unit: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  divider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
