import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../../reader/theme';

export interface SecondaryStat {
  label: string;
  value: number;
  /** Highlights a figure that needs attention (e.g. animals already registered). */
  alert?: boolean;
}

interface Props {
  eyebrow: string;
  value: number;
  unit: string;
  stats: SecondaryStat[];
  footer?: string | null;
  /** Top-right slot, e.g. the connection pill. */
  accessory?: React.ReactNode;
}

/** Green summary card with one figure big enough to read at the chute (design ref image.png, weather card). */
export function StatsCard({ eyebrow, value, unit, stats, footer, accessory }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.eyebrow} numberOfLines={1}>
          {eyebrow}
        </Text>
        {accessory}
      </View>

      <View style={styles.mainRow}>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <View style={styles.stats}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={[styles.statValue, stat.alert && styles.statAlert]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {footer ? (
        <>
          <View style={styles.divider} />
          <Text style={styles.footer} numberOfLines={2}>
            {footer}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, gap: 12, ...shadow.raised },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  eyebrow: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.onPrimaryMuted },
  mainRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  valueRow: { flexShrink: 1 },
  value: { fontFamily: fonts.semibold, fontSize: 64, lineHeight: 68, color: colors.onPrimary },
  unit: { fontFamily: fonts.medium, fontSize: 16, color: colors.onPrimary },
  stats: { gap: 8, alignItems: 'flex-end', paddingBottom: 2 },
  stat: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  statValue: { fontFamily: fonts.semibold, fontSize: 20, color: colors.onPrimary },
  statAlert: { color: colors.warningBg },
  statLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.onPrimaryMuted },
  divider: { height: 1, backgroundColor: colors.onPrimaryGlassBorder },
  footer: { fontFamily: fonts.regular, fontSize: 14, color: colors.onPrimary },
});
