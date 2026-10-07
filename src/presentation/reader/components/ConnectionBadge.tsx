import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ReaderStatus } from '../../../core/readers/ReaderSource';
import { StatusPill, StatusTone } from '../../components/ui/StatusPill';

export const CONNECTION_LOOK: Record<ReaderStatus['state'], { label: string; tone: StatusTone }> = {
  idle: { label: 'Sin lector', tone: 'neutral' },
  scanning: { label: 'Buscando…', tone: 'info' },
  connecting: { label: 'Conectando…', tone: 'info' },
  connected: { label: 'Conectado', tone: 'success' },
  reconnecting: { label: 'Reconectando…', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
};

export function connectionDetail(status: ReaderStatus): string | null {
  if (status.state === 'reconnecting') return `${status.deviceName} (intento ${status.attempt}: ${status.reason})`;
  if ('deviceName' in status) return status.deviceName;
  if (status.state === 'error') return status.message;
  return null;
}

export function ConnectionBadge({ status, online }: { status: ReaderStatus; online: boolean }) {
  const look = CONNECTION_LOOK[status.state];
  const detail = connectionDetail(status);

  return (
    <View style={styles.row}>
      <StatusPill label={detail ? `${look.label} · ${detail}` : look.label} tone={look.tone} />
      {!online && <StatusPill label="Sin sistema" tone="warning" />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
});
