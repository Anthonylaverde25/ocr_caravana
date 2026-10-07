import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  X,
  Truck,
  Baby,
  ArrowRightLeft,
  Milk,
  Layers,
  CheckCircle,
} from 'lucide-react-native';
import { KpiCategoryData } from '../../infrastructure/api/OperationalKpiApi';
import { colors, fonts, radius } from '../reader/theme';
import { KpiOrderItemCard } from './kpis/KpiOrderItemCard';

interface KpiDetailModalProps {
  visible: boolean;
  category: KpiCategoryData | null;
  onClose: () => void;
}

export function KpiDetailModal({ visible, category, onClose }: KpiDetailModalProps) {
  if (!category) return null;

  const renderIcon = () => {
    switch (category.key) {
      case 'entry_orders':
        return <Truck size={22} color={category.color} />;
      case 'birth_orders':
        return <Baby size={22} color={category.color} />;
      case 'transfer_orders':
        return <ArrowRightLeft size={22} color={category.color} />;
      case 'weaning_orders':
        return <Milk size={22} color={category.color} />;
      default:
        return <Layers size={22} color={category.color} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${category.color}15` }]}>
                {renderIcon()}
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{category.title}</Text>
                  <View style={[styles.templateBadge, { backgroundColor: `${category.color}20` }]}>
                    <Text style={[styles.templateBadgeText, { color: category.color }]}>
                      {category.template_code}
                    </Text>
                  </View>
                </View>
                <Text style={styles.subtitle}>{category.subtitle}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{category.total_pending}</Text>
              <Text style={styles.statLabel}>Docs pendientes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: category.color }]}>
                {category.total_planned_heads}
              </Text>
              <Text style={styles.statLabel}>Cabezas planificadas</Text>
            </View>
          </View>

          {/* Orders List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {category.items.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle size={44} color={colors.primary} />
                <Text style={styles.emptyTitle}>Al día</Text>
                <Text style={styles.emptyText}>
                  No hay órdenes ni documentos pendientes para {category.title.toLowerCase()}.
                </Text>
              </View>
            ) : (
              category.items.map((item) => (
                <KpiOrderItemCard key={`${item.id}-${item.code}`} item={item} />
              ))
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Cerrar Detalle</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  templateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateBadgeText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
  },
  subtitle: {
    fontFamily: fonts.regular, fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    fontFamily: fonts.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  scrollList: {
    maxHeight: 420,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
    marginTop: 6,
  },
  emptyText: {
    fontFamily: fonts.regular, fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
