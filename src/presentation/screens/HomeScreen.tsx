import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Clock } from 'lucide-react-native';
import { useReader } from '../reader/ReaderContext';
import { LocalRepo } from '../../infrastructure/storage/LocalRepo';
import {
  OperationalKpiApi,
  OperationalKpis,
  KpiCategoryData,
} from '../../infrastructure/api/OperationalKpiApi';
import { colors, fonts } from '../reader/theme';
import { AppHeader, HeaderBand } from '../components/AppHeader';
import { KpiDetailModal } from '../components/KpiDetailModal';
import { FioriPendingDocsList } from '../components/FioriPendingDocsList';
import { QuickActionsGrid } from '../components/home/QuickActionsGrid';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusPill } from '../components/ui/StatusPill';
import { MangaSessionHero } from '../components/home/MangaSessionHero';
import { ShiftBufferSummary } from '../components/home/ShiftBufferSummary';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { online, status, profile, session } = useReader();

  const [totalCount, setTotalCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // KPIs de órdenes y documentos operativos
  const [kpis, setKpis] = useState<OperationalKpis | null>(null);
  const [loadingKpis, setLoadingKpis] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<KpiCategoryData | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const isConnected = status.state === 'connected';

  const refreshStats = useCallback(() => {
    const all = LocalRepo.getAll();
    const pending = LocalRepo.getPendingSync();
    setTotalCount(all.length);
    setPendingCount(pending.length);
  }, []);

  const loadKpis = useCallback(async () => {
    try {
      const res = await OperationalKpiApi.getOperationalKpis();
      setKpis(res.data);
      setIsFromCache(res.fromCache);
    } catch {
      // Manejo con fallback silencioso a caché local
    } finally {
      setLoadingKpis(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStats();
      loadKpis();
    }, [refreshStats, loadKpis])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshStats();
    loadKpis();
  }, [refreshStats, loadKpis]);

  const handleOpenCategoryDetail = (category: KpiCategoryData) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <AppHeader greeting extended showStatus />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.onPrimary}
          />
        }
      >
        <HeaderBand />

        <MangaSessionHero
          session={session}
          online={online}
          isConnected={isConnected}
          profileDisplayName={profile.displayName}
          onOpenReader={() => navigation.navigate('Lector')}
        />

        <QuickActionsGrid onNavigate={(route) => navigation.navigate(route)} />

        <View style={styles.section}>
          <SectionHeader
            title="Documentos pendientes"
            actionLabel={kpis?.summary ? `${kpis.summary.total_pending_documents} docs` : undefined}
            meta={
              kpis?.summary?.last_updated_at ? (
                <View style={styles.lastUpdatedRow}>
                  <Clock size={12} color={colors.muted} />
                  <Text style={styles.lastUpdatedText}>
                    Actualizado {formatLastUpdated(kpis.summary.last_updated_at)}
                  </Text>
                  {isFromCache && <StatusPill label="Caché local" tone="warning" />}
                </View>
              ) : undefined
            }
          />

          {loadingKpis && !kpis ? (
            <Card style={styles.kpiLoadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.lastUpdatedText}>Sincronizando órdenes pendientes...</Text>
            </Card>
          ) : kpis ? (
            <FioriPendingDocsList kpis={kpis} onSelectCategory={handleOpenCategoryDetail} />
          ) : null}
        </View>

        <ShiftBufferSummary
          totalCount={totalCount}
          pendingCount={pendingCount}
          onOpenHistory={() => navigation.navigate('Historial')}
        />
      </ScrollView>

      <KpiDetailModal
        visible={modalVisible}
        category={selectedCategory}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 24 },
  section: { gap: 10 },
  lastUpdatedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lastUpdatedText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  kpiLoadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
});
