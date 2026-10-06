import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react-native';

interface ShiftBufferSummaryProps {
  totalCount: number;
  pendingCount: number;
  onOpenHistory: () => void;
}

export function ShiftBufferSummary({
  totalCount,
  pendingCount,
  onOpenHistory,
}: ShiftBufferSummaryProps) {
  const isAllSynced = pendingCount === 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>ESTADO DEL BUFFER LOCAL</Text>
        <TouchableOpacity
          style={styles.historyLink}
          onPress={onOpenHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.historyLinkText}>Ver historial</Text>
          <ChevronRight size={13} color="#047857" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.summaryBar}
        onPress={onOpenHistory}
        activeOpacity={0.7}
      >
        {/* Columna Total en Memoria */}
        <View style={styles.statColumn}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>En buffer local</Text>
        </View>

        <View style={styles.divider} />

        {/* Columna Pendientes Sync */}
        <View style={styles.statColumn}>
          <Text
            style={[
              styles.statNumber,
              pendingCount > 0 ? styles.statPendingWarning : styles.statSyncedSuccess,
            ]}
          >
            {pendingCount}
          </Text>
          <Text style={styles.statLabel}>Por sincronizar</Text>
        </View>

        <View style={styles.divider} />

        {/* Columna Estado de Integridad */}
        <View style={styles.statusColumn}>
          {isAllSynced ? (
            <View style={styles.statusPillSuccess}>
              <CheckCircle2 size={13} color="#047857" />
              <Text style={styles.statusTextSuccess}>Al día</Text>
            </View>
          ) : (
            <View style={styles.statusPillWarning}>
              <AlertTriangle size={13} color="#B45309" />
              <Text style={styles.statusTextWarning}>Pendiente</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  historyLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  summaryBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statSyncedSuccess: {
    color: '#047857',
  },
  statPendingWarning: {
    color: '#D97706',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
  },
  statusColumn: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  statusPillWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusTextWarning: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
});
