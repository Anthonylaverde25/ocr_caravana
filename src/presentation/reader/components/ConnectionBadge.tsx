import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReaderStatus } from '../../../core/readers/ReaderSource';
import { colors } from '../theme';

const LOOK: Record<ReaderStatus['state'], { label: string; color: string; bg: string }> = {
  idle: { label: 'Sin lector', color: colors.muted, bg: colors.background },
  scanning: { label: 'Buscando…', color: colors.info, bg: colors.infoBg },
  connecting: { label: 'Conectando…', color: colors.info, bg: colors.infoBg },
  connected: { label: 'Conectado', color: colors.success, bg: colors.successBg },
  reconnecting: { label: 'Reconectando…', color: colors.warning, bg: colors.warningBg },
  error: { label: 'Error', color: colors.danger, bg: colors.dangerBg },
};

export function ConnectionBadge({ status, online }: { status: ReaderStatus; online: boolean }) {
  const look = LOOK[status.state];
  const detail =
    'deviceName' in status ? status.deviceName :
    status.state === 'error' ? status.message : null;

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: look.bg }]}>
        <View style={[styles.dot, { backgroundColor: look.color }]} />
        <Text style={[styles.text, { color: look.color }]} numberOfLines={1}>
          {look.label}{detail ? ` · ${detail}` : ''}
          {status.state === 'reconnecting' ? ` (intento ${status.attempt}: ${status.reason})` : ''}
        </Text>
      </View>
      {!online && (
        <View style={[styles.badge, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.text, { color: colors.warning }]}>Sin sistema</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, gap: 6, maxWidth: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: '600' },
});
