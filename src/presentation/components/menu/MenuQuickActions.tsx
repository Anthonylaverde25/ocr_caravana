import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bluetooth, FileText, Clock, ChevronRight } from 'lucide-react-native';
import { QUICK_ACTIONS, QuickActionItem } from './menuCatalog';

export interface MenuQuickActionsProps {
  onSelectTab: (tab: 'Home' | 'Lector' | 'Planillas' | 'Historial') => void;
}

export function MenuQuickActions({ onSelectTab }: MenuQuickActionsProps) {
  const renderIcon = (iconName: QuickActionItem['iconName'], color: string) => {
    switch (iconName) {
      case 'bluetooth':
        return <Bluetooth size={18} color={color} />;
      case 'file-text':
        return <FileText size={18} color={color} />;
      case 'clock':
        return <Clock size={18} color={color} />;
      default:
        return <Bluetooth size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ACCIONES RÁPIDAS EN MANGA</Text>
      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { borderColor: action.color + '33' }]}
            onPress={() => onSelectTab(action.targetTab)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: action.bgColor }]}>
              {renderIcon(action.iconName, action.color)}
            </View>
            <View style={styles.textBox}>
              <Text style={styles.actionTitle} numberOfLines={1}>
                {action.title}
              </Text>
              <Text style={styles.actionSubtitle} numberOfLines={1}>
                {action.subtitle}
              </Text>
            </View>
            <ChevronRight size={14} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  actionsRow: {
    gap: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  actionSubtitle: {
    fontSize: 11.5,
    color: '#6B7280',
  },
});
