import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList,
  Truck,
  ChevronRight,
  House,
  Bluetooth,
  FileText,
  List,
} from 'lucide-react-native';
import { colors } from '../../reader/theme';
import { MenuHeader } from './MenuHeader';
import { MenuFooter } from './MenuFooter';
import { useNavMenu } from './MenuContext';

export interface FullScreenNavMenuProps {
  visible?: boolean;
  onClose?: () => void;
  onNavigateToTab?: (tab: 'Home' | 'Lector' | 'Planillas' | 'Historial') => void;
  onNavigateToScreen?: (screen: 'OperationsScreen' | 'DteScreen' | string) => void;
}

export function FullScreenNavMenu({
  visible: propVisible,
  onClose: propOnClose,
  onNavigateToTab,
  onNavigateToScreen,
}: FullScreenNavMenuProps) {
  let navMenuContext: ReturnType<typeof useNavMenu> | null = null;
  try {
    navMenuContext = useNavMenu();
  } catch {
    // Optional when rendered outside MenuProvider
  }

  const isVisible = propVisible !== undefined ? propVisible : (navMenuContext?.isMenuOpen ?? false);
  const handleClose = propOnClose || (navMenuContext ? navMenuContext.closeMenu : () => {});

  const handleGoToOperations = () => {
    handleClose();
    if (onNavigateToScreen) {
      onNavigateToScreen('OperationsScreen');
    }
  };

  const handleGoToDte = () => {
    handleClose();
    if (onNavigateToScreen) {
      onNavigateToScreen('DteScreen');
    }
  };

  const handleSelectTab = (tab: 'Home' | 'Lector' | 'Planillas' | 'Historial') => {
    handleClose();
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <MenuHeader onClose={handleClose} />
      </SafeAreaView>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>MÓDULOS PRINCIPALES</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona la actividad o consulta a realizar en manga
          </Text>
        </View>

        {/* Tarjeta 1: Operaciones */}
        <TouchableOpacity
          style={[styles.menuCard, styles.menuCardOperations]}
          onPress={handleGoToOperations}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
              <ClipboardList size={26} color="#059669" strokeWidth={2.2} />
            </View>
            <View style={[styles.badgePill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={[styles.badgePillText, { color: '#047857' }]}>ACTIVIDADES DE CAMPO</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Operaciones</Text>
            <Text style={styles.cardSubtitle}>Manga, Reproducción, Sanidad y Logística</Text>
            <Text style={styles.cardDescription}>
              Catálogo integral de pesadas periódicas, condición corporal, tacto, ecografía, registro de partos y planes de vacunación.
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.footerActionText, { color: '#059669' }]}>
              Ingresar al catálogo de operaciones
            </Text>
            <View style={[styles.chevronCircle, { backgroundColor: '#ECFDF5' }]}>
              <ChevronRight size={16} color="#059669" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Tarjeta 2: DTe / Recepciones */}
        <TouchableOpacity
          style={[styles.menuCard, styles.menuCardDte]}
          onPress={handleGoToDte}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F0F9FF' }]}>
              <Truck size={26} color="#0284C7" strokeWidth={2.2} />
            </View>
            <View style={[styles.badgePill, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
              <Text style={[styles.badgePillText, { color: '#0369A1' }]}>SENASA & GUÍAS</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>DTe / Recepciones</Text>
            <Text style={styles.cardSubtitle}>Control de Hacienda y Guías de Tránsito</Text>
            <Text style={styles.cardDescription}>
              Seguimiento de hacienda en tránsito, órdenes de compra externa, verificación de caravanas y recepción con DTE en manga.
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.footerActionText, { color: '#0284C7' }]}>
              Ver tropas y documentos de tránsito
            </Text>
            <View style={[styles.chevronCircle, { backgroundColor: '#F0F9FF' }]}>
              <ChevronRight size={16} color="#0284C7" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Accesos directos a Pestañas */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessHeading}>ACCESOS DIRECTOS</Text>
          <View style={styles.quickTabsGrid}>
            <TouchableOpacity
              style={styles.quickTabBtn}
              onPress={() => handleSelectTab('Home')}
              activeOpacity={0.7}
            >
              <House size={18} color="#4B5563" />
              <Text style={styles.quickTabBtnText}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickTabBtn}
              onPress={() => handleSelectTab('Lector')}
              activeOpacity={0.7}
            >
              <Bluetooth size={18} color="#059669" />
              <Text style={styles.quickTabBtnText}>Lector BLE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickTabBtn}
              onPress={() => handleSelectTab('Planillas')}
              activeOpacity={0.7}
            >
              <FileText size={18} color="#7C3AED" />
              <Text style={styles.quickTabBtnText}>Planillas IA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickTabBtn}
              onPress={() => handleSelectTab('Historial')}
              activeOpacity={0.7}
            >
              <List size={18} color="#2563EB" />
              <Text style={styles.quickTabBtnText}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer del Sistema */}
        <MenuFooter onClose={handleClose} />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: colors.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  sectionHeading: {
    paddingVertical: 4,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#4B5563',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  menuCardOperations: {
    borderColor: '#E5E7EB',
  },
  menuCardDte: {
    borderColor: '#E5E7EB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  cardDescription: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  quickAccessHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  quickTabsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  quickTabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
});
