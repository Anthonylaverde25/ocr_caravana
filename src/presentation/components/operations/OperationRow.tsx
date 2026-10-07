import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Tag,
  Scale,
  Activity,
  Milk,
  Baby,
  HeartPulse,
  Beef,
  ShieldPlus,
  ArrowRightLeft,
  Truck,
  ChevronRight,
  ClipboardList,
  FileText,
  LucideIcon,
} from 'lucide-react-native';
import { OperationItem } from './operationsCatalog';
import { colors, fonts, radius } from '../../reader/theme';
import { StatusPill } from '../ui/StatusPill';

const ICONS: Record<OperationItem['iconName'], LucideIcon> = {
  'file-text': FileText,
  tag: Tag,
  scale: Scale,
  activity: Activity,
  milk: Milk,
  baby: Baby,
  'heart-pulse': HeartPulse,
  beef: Beef,
  'shield-plus': ShieldPlus,
  'arrow-right-left': ArrowRightLeft,
  truck: Truck,
};

interface OperationRowProps {
  item: OperationItem;
  isLast: boolean;
  onPress: (item: OperationItem) => void;
}

/** List row in the style of design ref image4.png (equipment list): icon, title, detail, state pill. */
export function OperationRow({ item, isLast, onPress }: OperationRowProps) {
  const Icon = ICONS[item.iconName] ?? ClipboardList;

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      activeOpacity={0.65}
      onPress={() => onPress(item)}
    >
      <View style={[styles.iconBox, !item.available && styles.iconBoxMuted]}>
        <Icon size={22} color={item.available ? colors.primary : colors.subtle} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.trailing}>
        <StatusPill label={item.available ? 'Disponible' : 'Próximamente'} tone={item.available ? 'success' : 'neutral'} />
        <ChevronRight size={16} color={colors.subtle} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxMuted: { backgroundColor: colors.surfaceMuted },
  body: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  description: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.muted },
  trailing: { alignItems: 'flex-end', gap: 6 },
});
