import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Tag } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { colors } from '../reader/theme';
import {
  OperationCategory,
  OperationItem,
  ALL_OPERATIONS,
} from '../components/operations/operationsCatalog';
import { OperationSearchHeader } from '../components/operations/OperationSearchHeader';
import { OperationGridCard } from '../components/operations/OperationGridCard';

export function OperationsScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory>('TODAS');

  const filteredOperations = useMemo(() => {
    return ALL_OPERATIONS.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'TODAS' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleOperationPress = (item: OperationItem) => {
    if (item.available && item.targetTab) {
      navigation.navigate(item.targetTab);
    } else {
      Alert.alert(
        item.title,
        `${item.description}\n\nEste módulo está en fase de integración con el lector BLE y la balanza digital de manga.`,
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <AppHeader
        title="OPERACIONES"
        subtitle="Manga, Reproducción y Sanidad"
        showStatus={false}
      />

      <OperationSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredOperations.length === 0 ? (
          <View style={styles.emptyState}>
            <Tag size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Sin operaciones encontradas</Text>
            <Text style={styles.emptyDescription}>
              No hay módulos que coincidan con "{searchQuery}".
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredOperations.map((item) => (
              <OperationGridCard
                key={item.id}
                item={item}
                onPress={handleOperationPress}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
