import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Clock, CloudOff, FileText, Camera, ChevronRight } from 'lucide-react-native';
import { useReader } from '../reader/ReaderContext';
import { LocalRepo } from '../../infrastructure/storage/LocalRepo';
import {
  OperationalKpiApi,
  OperationalKpis,
  KpiCategoryData,
} from '../../infrastructure/api/OperationalKpiApi';
import { colors } from '../reader/theme';
import { AppHeader } from '../components/AppHeader';
import { KpiDetailModal } from '../components/KpiDetailModal';
import { FioriPendingDocsList } from '../components/FioriPendingDocsList';
import { CompactTelemetryStrip } from '../components/home/CompactTelemetryStrip';
import { MangaSessionHero } from '../components/home/MangaSessionHero';
import { ShiftBufferSummary } from '../components/home/ShiftBufferSummary';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { auth, online, status, profile, session } = useReader();

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
      {/* Header Minimalista Profesional */}
      <AppHeader
        title="GANADERO"
        subtitle={auth?.company?.name || 'Establecimiento Principal'}
        showStatus={true}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* 1. Telemetría Compacta (Servidor & Bastón BLE en un solo renglón) */}
        <CompactTelemetryStrip
          online={online}
          isConnected={isConnected}
          profileDisplayName={profile.displayName}
        />

        {/* 2. Hero Contextual de Sesión en Manga */}
        <MangaSessionHero
          session={session}
          onOpenReader={() => navigation.navigate('Lector')}
        />

        {/* 2.1 Banner Directo de Digitalización de Planillas */}
        <TouchableOpacity
          style={styles.scanBanner}
          onPress={() => navigation.navigate('Planillas')}
          activeOpacity={0.8}
        >
          <View style={styles.scanBannerIcon}>
            <FileText size={20} color="#7C3AED" />
          </View>
          <View style={styles.scanBannerContent}>
            <View style={styles.scanBannerHeader}>
              <Text style={styles.scanBannerTitle}>Escanear Planilla de Campo</Text>
              <View style={styles.scanBannerBadge}>
                <Camera size={10} color="#7C3AED" />
                <Text style={styles.scanBannerBadgeText}>IA</Text>
              </View>
            </View>
            <Text style={styles.scanBannerSubtitle}>
              Fotografiá o cargá planillas ING-01, TOR-01, PAR-01 o DEST-01
            </Text>
          </View>
          <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 3. Documentos Pendientes en Campo (SAP Fiori Flat) */}
        <View style={styles.kpiSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>DOCUMENTOS PENDIENTES EN CAMPO</Text>
            {kpis?.summary?.last_updated_at && (
              <View style={styles.lastUpdatedRow}>
                <Clock size={11} color={colors.muted} />
                <Text style={styles.lastUpdatedText}>
                  Actualizado {formatLastUpdated(kpis.summary.last_updated_at)}
                </Text>
                {isFromCache && (
                  <View style={styles.cacheBadge}>
                    <CloudOff size={10} color="#B45309" />
                    <Text style={styles.cacheBadgeText}>Caché Local</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {kpis?.summary && (
            <View style={styles.totalPendingBadge}>
              <Text style={styles.totalPendingBadgeValue}>
                {kpis.summary.total_pending_documents}
              </Text>
              <Text style={styles.totalPendingBadgeLabel}>Docs</Text>
            </View>
          )}
        </View>

        {loadingKpis && !kpis ? (
          <View style={styles.kpiLoadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.kpiLoadingText}>Sincronizando órdenes pendientes...</Text>
          </View>
        ) : kpis ? (
          <FioriPendingDocsList
            kpis={kpis}
            onSelectCategory={handleOpenCategoryDetail}
          />
        ) : null}

        {/* 4. Resumen Analítico de Buffer y Sincronización */}
        <ShiftBufferSummary
          totalCount={totalCount}
          pendingCount={pendingCount}
          onOpenHistory={() => navigation.navigate('Historial')}
        />
      </ScrollView>

      {/* Modal Drill-Down de Órdenes */}
      <KpiDetailModal
        visible={modalVisible}
        category={selectedCategory}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  kpiSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  lastUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: colors.muted,
  },
  cacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  cacheBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  totalPendingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: '#047857',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalPendingBadgeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalPendingBadgeLabel: {
    fontSize: 11,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  kpiLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  kpiLoadingText: {
    fontSize: 13,
    color: colors.muted,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scanBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBannerContent: {
    flex: 1,
  },
  scanBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  scanBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 3,
  },
  scanBannerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  scanBannerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});
