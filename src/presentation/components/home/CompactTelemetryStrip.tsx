import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bluetooth, Wifi, WifiOff } from 'lucide-react-native';

interface CompactTelemetryStripProps {
  online: boolean;
  isConnected: boolean;
  profileDisplayName: string;
}

export function CompactTelemetryStrip({
  online,
  isConnected,
  profileDisplayName,
}: CompactTelemetryStripProps) {
  return (
    <View style={styles.container}>
      {/* Estado del Servidor */}
      <View style={styles.statusItem}>
        <View style={[styles.dot, online ? styles.dotOnline : styles.dotOffline]} />
        <Text style={[styles.statusText, online ? styles.textOnline : styles.textOffline]}>
          {online ? 'Servidor activo' : 'Modo sin conexión'}
        </Text>
      </View>

      <Text style={styles.divider}>•</Text>

      {/* Estado del Lector BLE */}
      <View style={styles.statusItem}>
        <Bluetooth
          size={13}
          color={isConnected ? '#047857' : '#9CA3AF'}
          strokeWidth={2.2}
        />
        <Text
          style={[styles.statusText, isConnected ? styles.textBleConnected : styles.textBleDisconnected]}
          numberOfLines={1}
        >
          {isConnected ? profileDisplayName : 'Sin bastón'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#059669',
  },
  dotOffline: {
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textOnline: {
    color: '#047857',
  },
  textOffline: {
    color: '#B45309',
  },
  textBleConnected: {
    color: '#047857',
  },
  textBleDisconnected: {
    color: '#6B7280',
  },
  divider: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
