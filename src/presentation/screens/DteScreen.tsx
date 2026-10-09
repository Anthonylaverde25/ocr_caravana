import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Truck, CloudOff } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { colors, fonts, radius } from '../reader/theme';
import { EntryOrderApi } from '../../infrastructure/api/EntryOrderApi';
import { errorMessage } from '../../infrastructure/api/ApiClient';
import { ReceiveDteModal } from '../components/dte/ReceiveDteModal';
import { DteOrderCard } from '../components/dte/DteOrderCard';
import { DteSearchHeader } from '../components/dte/DteSearchHeader';
import { DteDisplayItem, DteFilterStatus, matchesDteFilter, toDisplayItems } from '../components/dte/dteItems';

export type { DteDisplayItem, DteFilterStatus } from '../components/dte/dteItems';

export function DteScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DteFilterStatus>('ALL');
  const [items, setItems] = useState<DteDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  /** When the copy shown was saved, if the server could not be reached. */
  const [offlineSince, setOfflineSince] = useState<string | null>(null);
  const [selectedDteItem, setSelectedDteItem] = useState<DteDisplayItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const { orders, offlineSince: savedAt } = await EntryOrderApi.list();
      setOfflineSince(savedAt);
      setItems(toDisplayItems(orders));
    } catch (err) {
      // Said as it is: no signal, a session that expired, a server error.
      setErrorMsg(`No se pudo sincronizar con el sistema (${errorMessage(err)}). Deslizá para reintentar.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Focus fires on the first mount too, so this is the only load trigger.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredItems = useMemo(
    () => items.filter((item) => matchesDteFilter(item, searchQuery, filterStatus)),
    [items, searchQuery, filterStatus]
  );

  const metrics = [
    { label: 'En tránsito', value: items.filter((i) => i.hasDte && i.pending_heads > 0).length },
    { label: 'Registros', value: items.length },
    { label: 'Cabezas', value: items.reduce((acc, i) => acc + (i.planned_heads || 0), 0) },
  ];

  /** "receive": the head in transit arrive with their caravans; "identify": caravans of head already received. */
  const handleOpenReceiveWithCaravans = (item: DteDisplayItem, mode: 'receive' | 'identify') => {
    if (!item.rawDte) return;
    navigation.navigate('ReceiveWithCaravansScreen', { order: item.order, dte: item.rawDte, mode });
  };

  const handleScanPlanilla = (item: DteDisplayItem) => {
    navigation.navigate('MainTabs', {
      screen: 'Planillas',
      params: { guia_dte: item.dte_number, batch_name: item.batch_name },
    });
  };

  const handleScanLector = (item: DteDisplayItem) => {
    navigation.navigate('MainTabs', { screen: 'Lector', params: { batch_name: item.batch_name } });
  };

  return (
    <View style={styles.screenWrapper}>
      <AppHeader
        title="DTe / Recepciones"
        subtitle="Control de hacienda SENASA"
        extended
        onBack={() => navigation.goBack()}
      />

      <DteSearchHeader
        metrics={metrics}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {offlineSince && (
        <View style={styles.offlineBanner}>
          <CloudOff size={15} color={colors.warningText} />
          <Text style={styles.offlineText}>
            Sin conexión: datos guardados el {new Date(offlineSince).toLocaleString('es-AR')}. Deslizá para actualizar.
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptySubtitle}>Cargando documentos de tránsito…</Text>
          </View>
        ) : errorMsg && items.length === 0 ? (
          <View style={styles.centered}>
            <CloudOff size={40} color={colors.danger} />
            <Text style={styles.emptyTitle}>Sin conexión</Text>
            <Text style={styles.emptySubtitle}>{errorMsg}</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.centered}>
            <Truck size={40} color={colors.subtle} />
            <Text style={styles.emptyTitle}>Sin registros encontrados</Text>
            <Text style={styles.emptySubtitle}>No hay documentos que coincidan con la búsqueda o el filtro.</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <DteOrderCard
              key={`${item.order_id}-${item.id}`}
              item={item}
              onQuickCount={setSelectedDteItem}
              onReceiveWithCaravans={handleOpenReceiveWithCaravans}
              onScanSheet={handleScanPlanilla}
              onOpenReader={handleScanLector}
            />
          ))
        )}
      </ScrollView>

      {selectedDteItem && (
        <ReceiveDteModal
          visible
          onClose={() => setSelectedDteItem(null)}
          onSuccess={loadData}
          orderId={selectedDteItem.order_id}
          orderCode={selectedDteItem.code}
          dte={
            selectedDteItem.rawDte || {
              id: selectedDteItem.id,
              dte_number: selectedDteItem.dte_number || '',
              dte_date: selectedDteItem.date,
              head_count: selectedDteItem.planned_heads,
              received_count: selectedDteItem.heads_received,
              caravaned_count: 0,
              uncaravaned_count: 0,
              pending_count: selectedDteItem.pending_heads,
              missing_head_count: 0,
            }
          }
          providerName={selectedDteItem.provider_name}
          batchName={selectedDteItem.batch_name}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingTop: 12, paddingBottom: 32, gap: 14 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.warningBg,
  },
  offlineText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.warningText },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 16, gap: 8 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center' },
});
