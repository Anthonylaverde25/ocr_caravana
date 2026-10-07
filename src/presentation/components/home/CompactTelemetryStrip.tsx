import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bluetooth, BluetoothOff, Cloud, CloudOff } from 'lucide-react-native';
import { colors, fonts } from '../../reader/theme';

interface CompactTelemetryStripProps {
  online: boolean;
  isConnected: boolean;
  profileDisplayName: string;
}

/** Server and wand state side by side, like the sunrise / sunset pair of design ref image.png. */
export function CompactTelemetryStrip({ online, isConnected, profileDisplayName }: CompactTelemetryStripProps) {
  const ServerIcon = online ? Cloud : CloudOff;
  const BleIcon = isConnected ? Bluetooth : BluetoothOff;

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <ServerIcon size={18} color={online ? colors.primary : colors.warning} />
        <View style={styles.textColumn}>
          <Text style={styles.value}>{online ? 'En línea' : 'Sin conexión'}</Text>
          <Text style={styles.caption}>Servidor</Text>
        </View>
      </View>

      <View style={styles.connector} />

      <View style={[styles.item, styles.itemEnd]}>
        <View style={[styles.textColumn, styles.textEnd]}>
          <Text style={styles.value} numberOfLines={1}>
            {isConnected ? profileDisplayName : 'Sin bastón'}
          </Text>
          <Text style={styles.caption}>Lector BLE</Text>
        </View>
        <BleIcon size={18} color={isConnected ? colors.primary : colors.subtle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  itemEnd: { justifyContent: 'flex-end' },
  textColumn: { gap: 1, flexShrink: 1 },
  textEnd: { alignItems: 'flex-end' },
  value: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  caption: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  connector: {
    flex: 1,
    minWidth: 24,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
});
