import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Tag } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { colors, fonts } from '../reader/theme';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  OperationCategory,
  OperationItem,
  ALL_OPERATIONS,
  OPERATION_CATEGORIES,
} from '../components/operations/operationsCatalog';
import { OperationSearchHeader, categoryLabel } from '../components/operations/OperationSearchHeader';
import { OperationRow } from '../components/operations/OperationRow';

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

  const groups = OPERATION_CATEGORIES.filter((c) => c !== 'TODAS')
    .map((category) => ({ category, items: filteredOperations.filter((item) => item.category === category) }))
    .filter((group) => group.items.length > 0);

  return (
    <View style={styles.screenWrapper}>
      <AppHeader title="Operaciones" subtitle="Manga, reproducción y sanidad" extended onBack={() => navigation.goBack()} />

      <OperationSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Tag size={36} color={colors.subtle} />
            <Text style={styles.emptyTitle}>Sin operaciones encontradas</Text>
            <Text style={styles.emptyDescription}>No hay módulos que coincidan con "{searchQuery}".</Text>
          </View>
        ) : (
          groups.map(({ category, items }) => (
            <View key={category} style={styles.group}>
              <SectionHeader title={categoryLabel(category)} actionLabel={`${items.length}`} />
              <Card padding={0} style={styles.groupCard}>
                {items.map((item, index) => (
                  <OperationRow
                    key={item.id}
                    item={item}
                    isLast={index === items.length - 1}
                    onPress={handleOperationPress}
                  />
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingTop: 12, paddingBottom: 32, gap: 22 },
  group: { gap: 10 },
  groupCard: { paddingHorizontal: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  emptyDescription: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center' },
});
