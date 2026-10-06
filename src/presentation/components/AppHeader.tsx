import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bluetooth } from 'lucide-react-native';
import { useReader } from '../reader/ReaderContext';
import { colors } from '../reader/theme';
import { ErpLogo } from './ErpLogo';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showStatus?: boolean;
  rightElement?: React.ReactNode;
}

export function AppHeader({
  title = 'GANADERO',
  subtitle,
  showStatus = true,
  rightElement,
}: AppHeaderProps) {
  const { auth, signOut, online, status } = useReader();

  const isBleConnected = status.state === 'connected';
  const companyName = subtitle || auth?.company?.name || 'Establecimiento Principal';
  const userName = auth?.userName || 'Operador';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleProfilePress = () => {
    Alert.alert(
      userName,
      `Establecimiento: ${companyName}\nEstado: ${online ? 'Conectado a internet' : 'Modo fuera de línea'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeContainer}>
      <View style={styles.header}>
        {/* Lado Izquierdo: Isotipo de Marca Oficial y Título */}
        <View style={styles.leftSection}>
          <View style={styles.logoBadge}>
            <ErpLogo size={24} color="#FFFFFF" strokeWidth={3.2} />
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {companyName}
            </Text>
          </View>
        </View>

        {/* Lado Derecho: Indicador de Bastón BLE y Avatar de Usuario */}
        <View style={styles.rightSection}>
          {rightElement ? (
            rightElement
          ) : (
            <>
              {showStatus && (
                <View style={styles.telemetryRow}>
                  {/* Indicador de Bastón BLE */}
                  <View
                    style={[
                      styles.telemetryBadge,
                      isBleConnected ? styles.telemetryBleActive : styles.telemetryBleInactive,
                    ]}
                  >
                    <Bluetooth
                      size={14}
                      color={isBleConnected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)'}
                    />
                  </View>
                </View>
              )}

              {/* Botón de Perfil / Avatar del Operador */}
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={handleProfilePress}
                activeOpacity={0.8}
                accessibilityLabel="Perfil del operador"
              >
                <Text style={styles.avatarText}>{userInitial}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: colors.primaryDark,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.primaryDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#D1FAE5', // Soft Mint Emerald
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryBleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  telemetryBleInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});
