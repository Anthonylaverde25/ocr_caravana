import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useReader } from '../../reader/ReaderContext';
import { colors } from '../../reader/theme';
import { ErpLogo } from '../ErpLogo';

export interface MenuHeaderProps {
  onClose: () => void;
}

export function MenuHeader({ onClose }: MenuHeaderProps) {
  const { auth } = useReader();
  const companyName = auth?.company?.name || 'Establecimiento Principal';
  const userName = auth?.userName || 'Operador';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <ErpLogo size={22} color="#FFFFFF" strokeWidth={3.2} />
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.brandTitle} numberOfLines={1}>
            GANADERO
          </Text>
          <Text style={styles.brandSubtitle} numberOfLines={1}>
            {companyName}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <View style={styles.operatorBadge}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <Text style={styles.operatorName} numberOfLines={1}>
            {userName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Cerrar menú"
        >
          <X size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 64,
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
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
    color: '#D1FAE5',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  operatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 16,
    gap: 6,
    maxWidth: 120,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  operatorName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
