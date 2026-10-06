import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity, Tag, ChevronRight } from 'lucide-react-native';
import { RegistrationSession } from '../../../core/entities/RegistrationSession';

interface MangaSessionHeroProps {
  session: RegistrationSession | null;
  onOpenReader: () => void;
}

export function MangaSessionHero({ session, onOpenReader }: MangaSessionHeroProps) {
  if (session) {
    return (
      <View style={styles.activeCard}>
        <View style={styles.activeHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>SESIÓN EN CURSO</Text>
          </View>
          <View style={styles.readingsBadge}>
            <Text style={styles.readingsCount}>{session.readings.length}</Text>
            <Text style={styles.readingsLabel}>leídos</Text>
          </View>
        </View>

        <View style={styles.activeBody}>
          <Text style={styles.batchName} numberOfLines={1}>
            {session.header.batchName || 'Alta general de caravanas'}
          </Text>
          <Text style={styles.batchMeta}>
            Manga operativa • Registro continuo con bastón BLE
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onOpenReader}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuar en manga</Text>
          <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.idleCard}>
      <View style={styles.idleContent}>
        <View style={styles.idleIconBox}>
          <Tag size={20} color="#047857" />
        </View>
        <View style={styles.idleTextContainer}>
          <Text style={styles.idleTitle}>Identificación Electrónica</Text>
          <Text style={styles.idleSubtitle}>
            Lectura con bastón BLE y alta estricta en manga
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startReaderButton}
        onPress={onOpenReader}
        activeOpacity={0.8}
      >
        <Text style={styles.startReaderText}>Iniciar Lectura</Text>
        <ChevronRight size={15} color="#047857" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 12,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  readingsBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  readingsCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
  },
  readingsLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeBody: {
    gap: 2,
  },
  batchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  batchMeta: {
    fontSize: 12,
    color: '#4B5563',
  },
  continueButton: {
    backgroundColor: '#047857',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  idleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  idleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  idleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleTextContainer: {
    flex: 1,
    gap: 2,
  },
  idleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  idleSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  startReaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  startReaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
});
