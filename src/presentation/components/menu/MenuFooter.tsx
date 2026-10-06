import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bluetooth, Wifi, WifiOff, LogOut } from 'lucide-react-native';
import { useReader } from '../../reader/ReaderContext';
import { colors } from '../../reader/theme';

export interface MenuFooterProps {
  onClose: () => void;
}

export function MenuFooter({ onClose }: MenuFooterProps) {
  const { signOut, online, status, profile } = useReader();
  const isBleConnected = status.state === 'connected';

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que querés salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            onClose();
            signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.telemetryCard}>
        <View style={styles.statusRow}>
          {/* BLE Status */}
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                isBleConnected ? styles.dotConnected : styles.dotDisconnected,
              ]}
            >
              <Bluetooth
                size={12}
                color={isBleConnected ? '#059669' : '#9CA3AF'}
              />
            </View>
            <View>
              <Text style={styles.statusLabel}>Bastón BLE</Text>
              <Text style={styles.statusValue}>
                {isBleConnected ? profile.displayName : 'Sin conectar'}
              </Text>
            </View>
          </View>

          {/* Network Status */}
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                online ? styles.dotConnected : styles.dotOffline,
              ]}
            >
              {online ? (
                <Wifi size={12} color="#059669" />
              ) : (
                <WifiOff size={12} color="#DC2626" />
              )}
            </View>
            <View>
              <Text style={styles.statusLabel}>Servidor</Text>
              <Text style={styles.statusValue}>
                {online ? 'En línea' : 'Modo offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>GANADERO v1.0.0 · Operativa de Manga & OCR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  telemetryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotConnected: {
    backgroundColor: '#ECFDF5',
  },
  dotDisconnected: {
    backgroundColor: '#F3F4F6',
  },
  dotOffline: {
    backgroundColor: '#FEF2F2',
  },
  statusLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
