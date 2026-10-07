import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Play, ChevronRight, Tag } from 'lucide-react-native';
import { RegistrationSession } from '../../../core/entities/RegistrationSession';
import { colors, fonts, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { PillButton } from '../ui/PillButton';
import { StatusPill } from '../ui/StatusPill';
import { CompactTelemetryStrip } from './CompactTelemetryStrip';
import { SessionMetricsRow } from './SessionMetricsRow';

interface MangaSessionHeroProps {
  session: RegistrationSession | null;
  online: boolean;
  isConnected: boolean;
  profileDisplayName: string;
  onOpenReader: () => void;
}

/** The chute at a glance: the open session (or an invitation to start one) plus server and wand state. */
export function MangaSessionHero({ session, online, isConnected, profileDisplayName, onOpenReader }: MangaSessionHeroProps) {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Tag size={16} color={colors.primary} />
          </View>
          <Text style={styles.context} numberOfLines={1}>
            {session ? session.header.batchName || 'Alta general de caravanas' : 'Identificación electrónica'}
          </Text>
        </View>
        {session ? <StatusPill label="En curso" tone="success" /> : <StatusPill label="Sin sesión" />}
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count}>{session ? session.readings.length : 0}</Text>
        <View style={styles.countCaption}>
          <Text style={styles.countUnit}>caravanas</Text>
          <Text style={styles.countHint}>{session ? 'leídas en la manga' : 'Lectura con bastón BLE'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {session ? (
        <SessionMetricsRow session={session} />
      ) : (
        <Text style={styles.idleText}>
          Conectá el bastón, armá la sesión y revisá las caravanas antes de darlas de alta.
        </Text>
      )}

      <CompactTelemetryStrip online={online} isConnected={isConnected} profileDisplayName={profileDisplayName} />

      <PillButton
        label={session ? 'Continuar en manga' : 'Iniciar lectura'}
        icon={session ? ChevronRight : Play}
        onPress={onOpenReader}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, borderRadius: radius.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  context: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  countRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  count: { fontFamily: fonts.semibold, fontSize: 56, lineHeight: 60, color: colors.text },
  countCaption: { paddingBottom: 8, gap: 1 },
  countUnit: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  countHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  divider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
  idleText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
});
