import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bluetooth, ChevronRight, Play, Tag } from 'lucide-react-native';
import { RegistrationSession } from '../../../core/entities/RegistrationSession';
import { colors, fonts, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { PillButton } from '../ui/PillButton';
import { StatusPill } from '../ui/StatusPill';
import { CompactTelemetryStrip } from './CompactTelemetryStrip';

interface Props {
  session: RegistrationSession | null;
  online: boolean;
  isConnected: boolean;
  profileDisplayName: string;
  onOpenReader: () => void;
}

/** Today's work at the chute: the open session, or the way into one (wand first). */
export function MangaSessionCard({ session, online, isConnected, profileDisplayName, onOpenReader }: Props) {
  const title = session ? session.header.batchName || 'Alta general de caravanas' : 'Lector de manga';
  const subtitle = session
    ? `${session.readings.length} ${session.readings.length === 1 ? 'caravana leída' : 'caravanas leídas'}`
    : 'Leé caravanas con el bastón y dalas de alta';

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Tag size={18} color={colors.primary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        {/* Without the wand an open session cannot receive readings: it is paused, not lost. */}
        {session && <StatusPill label={isConnected ? 'En curso' : 'En pausa'} tone={isConnected ? 'success' : 'warning'} />}
      </View>

      <CompactTelemetryStrip online={online} isConnected={isConnected} profileDisplayName={profileDisplayName} />

      <PillButton
        label={session ? 'Continuar en manga' : isConnected ? 'Armar la sesión' : 'Conectar lector'}
        icon={session ? ChevronRight : isConnected ? Play : Bluetooth}
        variant={session ? 'primary' : 'soft'}
        onPress={onOpenReader}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 1 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});
