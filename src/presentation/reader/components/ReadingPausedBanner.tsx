import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Bluetooth, BluetoothOff } from 'lucide-react-native';
import { ReaderStatus } from '../../../core/readers/ReaderSource';
import { PillButton } from '../../components/ui/PillButton';
import { colors, fonts, radius } from '../theme';

interface Props {
  status: ReaderStatus;
  /** Readings already in the session: they are saved, so the operator knows nothing is lost. */
  savedCount: number;
  onReconnect: () => void;
}

/**
 * Without a connected wand no caravan can arrive, so reading is paused, not over: what was read is
 * already saved and the session picks up where it stopped once the wand is back.
 */
export function ReadingPausedBanner({ status, savedCount, onReconnect }: Props) {
  if (status.state === 'connected') return null;

  const reconnecting = status.state === 'reconnecting' || status.state === 'connecting';
  const saved = savedCount === 1 ? 'La lectura hecha está guardada' : `Las ${savedCount} lecturas hechas están guardadas`;
  const detail =
    status.state === 'reconnecting'
      ? `Intento ${status.attempt}: ${status.reason}.`
      : status.state === 'error'
      ? `${status.message}.`
      : 'El bastón no está conectado.';

  return (
    <View style={styles.banner}>
      <View style={styles.titleRow}>
        {reconnecting ? <ActivityIndicator size="small" color={colors.warningText} /> : <BluetoothOff size={18} color={colors.warningText} />}
        <Text style={styles.title}>{reconnecting ? 'Lectura en pausa · reconectando…' : 'Lectura en pausa'}</Text>
      </View>
      <Text style={styles.text}>
        {detail} {saved} en el teléfono; se sigue desde acá al reconectar.
      </Text>
      {!reconnecting && <PillButton label="Reconectar el bastón" icon={Bluetooth} onPress={onReconnect} />}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.warningBg, borderRadius: radius.lg, padding: 16, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.warningText },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.warningText },
});
