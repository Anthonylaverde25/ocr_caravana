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
} from 'lucide-react-native';
import { OperationItem } from './operationsCatalog';

interface OperationGridCardProps {
  item: OperationItem;
  onPress: (item: OperationItem) => void;
}

export function OperationGridCard({ item, onPress }: OperationGridCardProps) {
  const renderIcon = (name: OperationItem['iconName'], color: string) => {
    switch (name) {
      case 'file-text':
        return <FileText size={22} color={color} />;
      case 'tag':
        return <Tag size={22} color={color} />;
      case 'scale':
        return <Scale size={22} color={color} />;
      case 'activity':
        return <Activity size={22} color={color} />;
      case 'milk':
        return <Milk size={22} color={color} />;
      case 'baby':
        return <Baby size={22} color={color} />;
      case 'heart-pulse':
        return <HeartPulse size={22} color={color} />;
      case 'beef':
        return <Beef size={22} color={color} />;
      case 'shield-plus':
        return <ShieldPlus size={22} color={color} />;
      case 'arrow-right-left':
        return <ArrowRightLeft size={22} color={color} />;
      case 'truck':
        return <Truck size={22} color={color} />;
      default:
        return <ClipboardList size={22} color={color} />;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !item.available && styles.cardUnavailable]}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
          {renderIcon(item.iconName, item.iconColor)}
        </View>
        <View
          style={[
            styles.badge,
            item.available ? styles.badgeActive : styles.badgeUpcoming,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.available ? styles.badgeTextActive : styles.badgeTextUpcoming,
            ]}
          >
            {item.badgeLabel}
          </Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.cardBody}>
        <Text style={styles.categoryLabel}>{item.categoryLabel}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      {/* Pie interactivo */}
      <View style={styles.cardFooter}>
        <Text
          style={[
            styles.actionText,
            item.available ? styles.actionTextActive : styles.actionTextUpcoming,
          ]}
        >
          {item.available ? 'Abrir en manga' : 'Ver detalle'}
        </Text>
        <ChevronRight size={14} color={item.available ? '#047857' : '#9CA3AF'} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardUnavailable: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#ECFDF5',
  },
  badgeUpcoming: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#047857',
  },
  badgeTextUpcoming: {
    color: '#6B7280',
  },
  cardBody: {
    gap: 2,
    minHeight: 80,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#047857',
  },
  actionTextUpcoming: {
    color: '#9CA3AF',
  },
});
