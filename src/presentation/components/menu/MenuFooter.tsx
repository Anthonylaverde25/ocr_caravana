import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useReader } from '../../reader/ReaderContext';
import { colors, fonts, radius } from '../../reader/theme';
import { CompactTelemetryStrip } from '../home/CompactTelemetryStrip';
import { Card } from '../ui/Card';

export interface MenuFooterProps {
  onClose?: () => void;
}

export function MenuFooter({ onClose }: MenuFooterProps) {
  const { signOut, online, status, profile } = useReader();

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir de la aplicación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          onClose?.();
          signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CompactTelemetryStrip
          online={online}
          isConnected={status.state === 'connected'}
          profileDisplayName={profile.displayName}
        />
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <LogOut size={16} color={colors.danger} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.versionText}>RXNA Ganadero v1.0.0 · Operativa de manga</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8, gap: 12 },
  card: { gap: 16 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerBg,
  },
  signOutText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger },
  versionText: { fontFamily: fonts.regular, fontSize: 12, color: colors.subtle, textAlign: 'center' },
});
