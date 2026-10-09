import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { Bluetooth, BluetoothOff } from 'lucide-react-native';
import { ReaderStatus } from '../../core/readers/ReaderSource';
import { useReader } from '../reader/ReaderContext';
import { colors } from '../reader/theme';

type Look = { on: boolean; dot: string | null; label: string };

function lookOf(status: ReaderStatus): Look {
  switch (status.state) {
    case 'connected':
      return { on: true, dot: colors.success, label: `Bastón conectado: ${status.deviceName}` };
    case 'connecting':
    case 'reconnecting':
      return { on: false, dot: colors.warning, label: 'Reconectando el bastón' };
    case 'error':
      return { on: false, dot: colors.danger, label: `Error del bastón: ${status.message}` };
    default:
      return { on: false, dot: null, label: 'Bastón desconectado' };
  }
}

/**
 * The wand's link, on every header: it belongs to the whole app (ReaderProvider), not to the
 * reading screens, so the operator sees it is up wherever they are. A tap opens the connection.
 */
export function ReaderStatusButton() {
  const { status } = useReader();
  const navigation = useNavigation();
  const look = lookOf(status);

  // Every header sits under the root stack; popTo returns to the tabs instead of stacking a copy.
  const openConnection = () =>
    navigation.dispatch(StackActions.popTo('MainTabs', { screen: 'Lector', params: { screen: 'Connect' } }));

  return (
    <TouchableOpacity
      style={[styles.circle, look.on ? styles.on : styles.off]}
      onPress={openConnection}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={look.label}
    >
      {look.on ? (
        <Bluetooth size={19} color={colors.primary} strokeWidth={2.4} />
      ) : (
        <BluetoothOff size={18} color={colors.onPrimaryMuted} />
      )}
      {look.dot && <View style={[styles.dot, { backgroundColor: look.dot }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  // Solid white when connected, so it reads at a glance against the green header.
  on: { backgroundColor: colors.surface },
  off: { backgroundColor: colors.onPrimaryGlass, borderWidth: 1, borderColor: colors.onPrimaryGlassBorder },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
