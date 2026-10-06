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
  Stethoscope,
  ArrowRightLeft,
  Truck,
  FileText,
  ChevronRight,
} from 'lucide-react-native';
import { MenuItem } from './menuCatalog';

export interface MenuModuleCardProps {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
}

export function MenuModuleCard({ item, onPress }: MenuModuleCardProps) {
  const renderIcon = () => {
    const props = { size: 20, color: item.iconColor };
    switch (item.iconName) {
      case 'file-text':
        return <FileText {...props} />;
      case 'tag':
        return <Tag {...props} />;
      case 'scale':
        return <Scale {...props} />;
      case 'activity':
        return <Activity {...props} />;
      case 'milk':
        return <Milk {...props} />;
      case 'baby':
        return <Baby {...props} />;
      case 'heart-pulse':
        return <HeartPulse {...props} />;
      case 'beef':
        return <Beef {...props} />;
      case 'shield-plus':
        return <ShieldPlus {...props} />;
      case 'stethoscope':
        return <Stethoscope {...props} />;
      case 'arrow-right-left':
        return <ArrowRightLeft {...props} />;
      case 'truck':
        return <Truck {...props} />;
      default:
        return <Tag {...props} />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        item.available ? styles.cardAvailable : styles.cardUpcoming,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
          {renderIcon()}
        </View>

        <View
          style={[
            styles.badge,
            item.available ? styles.badgeAvailable : styles.badgeUpcoming,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.available ? styles.badgeTextAvailable : styles.badgeTextUpcoming,
            ]}
          >
            {item.badgeLabel}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.categoryLabel}>{item.categoryLabel}</Text>
        {item.available && (
          <ChevronRight size={14} color={item.iconColor} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
    width: '48%',
    minHeight: 145,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardAvailable: {
    borderColor: '#E5E7EB',
  },
  cardUpcoming: {
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  badgeUpcoming: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextAvailable: {
    color: '#059669',
  },
  badgeTextUpcoming: {
    color: '#9CA3AF',
  },
  content: {
    marginVertical: 8,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 10.5,
    color: '#6B7280',
    lineHeight: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  categoryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.4,
  },
});
