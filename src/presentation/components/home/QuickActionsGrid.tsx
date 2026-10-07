import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bluetooth, FileText, LayoutGrid, Truck, LucideIcon } from 'lucide-react-native';
import { colors, fonts, radius, shadow } from '../../reader/theme';

interface QuickAction {
  key: string;
  label: string;
  icon: LucideIcon;
  route: string;
  badge?: string;
}

const ACTIONS: QuickAction[] = [
  { key: 'reader', label: 'Lector', icon: Bluetooth, route: 'Lector' },
  { key: 'sheets', label: 'Planillas', icon: FileText, route: 'Planillas', badge: 'IA' },
  { key: 'operations', label: 'Operaciones', icon: LayoutGrid, route: 'OperationsScreen' },
  { key: 'dte', label: 'DTe', icon: Truck, route: 'DteScreen' },
];

/** Four-tile shortcut row (design ref image.png, "Invest by Category"). */
export function QuickActionsGrid({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <View style={styles.row}>
      {ACTIONS.map(({ key, label, icon: Icon, route, badge }) => (
        <TouchableOpacity
          key={key}
          style={styles.tile}
          onPress={() => onNavigate(route)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <View style={styles.iconCircle}>
            <Icon size={22} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.card,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.infoBg,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.info },
});
