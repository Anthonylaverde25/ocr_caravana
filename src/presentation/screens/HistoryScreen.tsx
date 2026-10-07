import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Inbox } from 'lucide-react-native';
import { LocalRepo } from '../../infrastructure/storage/LocalRepo';
import { Caravana } from '../../core/entities/Caravana';
import { colors, fonts, radius } from '../reader/theme';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { StatusPill } from '../components/ui/StatusPill';

export const HistoryScreen = () => {
  const [caravanas, setCaravanas] = useState<Caravana[]>([]);

  const loadData = () => {
    const sorted = [...LocalRepo.getAll()].sort(
      (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
    setCaravanas(sorted);
  };

  useFocusEffect(useCallback(() => loadData(), []));

  const handleClear = () => {
    Alert.alert('Limpiar historial', '¿Seguro que querés borrar todos los registros locales?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar todo',
        style: 'destructive',
        onPress: () => {
          LocalRepo.clearAll();
          loadData();
        },
      },
    ]);
  };

  const pending = caravanas.filter((c) => !c.isSynced).length;

  const header = (
    <View style={styles.listHeader}>
      <StatsCard
        eyebrow="Guardado en el teléfono"
        value={caravanas.length}
        unit={caravanas.length === 1 ? 'registro' : 'registros'}
        stats={[
          { label: 'sincronizados', value: caravanas.length - pending },
          { label: 'pendientes', value: pending, alert: pending > 0 },
        ]}
      />
      <SectionHeader
        title="Lecturas"
        actionLabel="Borrar todo"
        onAction={caravanas.length > 0 ? handleClear : undefined}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Historial" subtitle="Lecturas guardadas en el teléfono" />

      <FlatList
        data={caravanas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.tagText}>{item.tag}</Text>
              <Text style={styles.dateText}>{new Date(item.scannedAt).toLocaleString()}</Text>
            </View>
            <StatusPill label={item.isSynced ? 'Sincronizado' : 'Pendiente'} tone={item.isSynced ? 'success' : 'warning'} />
          </View>
        )}
        ListEmptyComponent={
          <Card style={styles.empty}>
            <Inbox size={28} color={colors.subtle} />
            <Text style={styles.emptyText}>Todavía no hay lecturas guardadas en el teléfono.</Text>
          </Card>
        }
        onRefresh={loadData}
        refreshing={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, gap: 8, paddingBottom: 32 },
  listHeader: { gap: 20, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  rowBody: { flex: 1, gap: 2 },
  tagText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text, fontVariant: ['tabular-nums'] },
  dateText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
});
