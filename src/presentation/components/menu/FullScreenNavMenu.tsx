import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Tag } from 'lucide-react-native';
import { colors } from '../../reader/theme';
import {
  ALL_MENU_ITEMS,
  MENU_CATEGORIES,
  MenuItem,
} from './menuCatalog';
import { MenuHeader } from './MenuHeader';
import { MenuQuickActions } from './MenuQuickActions';
import { MenuCategorySection } from './MenuCategorySection';
import { MenuModuleCard } from './MenuModuleCard';
import { MenuFooter } from './MenuFooter';

import { useNavMenu } from './MenuContext';

export interface FullScreenNavMenuProps {
  visible?: boolean;
  onClose?: () => void;
  onNavigateToTab: (tab: 'Home' | 'Lector' | 'Planillas' | 'Historial') => void;
}

export function FullScreenNavMenu({
  visible: propVisible,
  onClose: propOnClose,
  onNavigateToTab,
}: FullScreenNavMenuProps) {
  let navMenuContext: ReturnType<typeof useNavMenu> | null = null;
  try {
    navMenuContext = useNavMenu();
  } catch {
    // Optional when rendered outside MenuProvider
  }

  const isVisible = propVisible !== undefined ? propVisible : (navMenuContext?.isMenuOpen ?? false);
  const handleClose = propOnClose || (navMenuContext ? navMenuContext.closeMenu : () => {});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return ALL_MENU_ITEMS;
    const query = searchQuery.toLowerCase().trim();
    return ALL_MENU_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectModule = (item: MenuItem) => {
    if (item.available && item.targetTab) {
      handleClose();
      onNavigateToTab(item.targetTab);
    } else {
      Alert.alert(
        item.title,
        `${item.description}\n\nEste módulo está en fase de integración activa con el lector BLE y la balanza digital de manga.`,
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const handleSelectQuickTab = (tab: 'Home' | 'Lector' | 'Planillas' | 'Historial') => {
    handleClose();
    onNavigateToTab(tab);
  };

  const isSearching = searchQuery.trim().length > 0;

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

      <View style={styles.container}>
        {/* Barra de Búsqueda de Módulos */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar módulo, pesaje, tacto, sanidad..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isSearching ? (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchHeading}>
                RESULTADOS ({filteredItems.length})
              </Text>

              {filteredItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Tag size={36} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>Sin módulos encontrados</Text>
                  <Text style={styles.emptyText}>
                    No hay operaciones coincidentes con "{searchQuery}".
                  </Text>
                </View>
              ) : (
                <View style={styles.searchGrid}>
                  {filteredItems.map((item) => (
                    <MenuModuleCard
                      key={item.id}
                      item={item}
                      onPress={handleSelectModule}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Acciones Rápidas */}
              <MenuQuickActions onSelectTab={handleSelectQuickTab} />

              {/* Secciones por Categoría */}
              {MENU_CATEGORIES.map((category) => {
                const categoryItems = ALL_MENU_ITEMS.filter(
                  (item) => item.category === category.key
                );
                return (
                  <MenuCategorySection
                    key={category.key}
                    category={category}
                    items={categoryItems}
                    onSelectModule={handleSelectModule}
                  />
                );
              })}
            </>
          )}

          {/* Footer del Sistema */}
          <MenuFooter onClose={handleClose} />
        </ScrollView>
      </View>
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
  searchWrapper: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  searchHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  searchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
