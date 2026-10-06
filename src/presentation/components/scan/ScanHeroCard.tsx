import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, Image, Sparkles, AlertCircle } from 'lucide-react-native';
import { colors } from '../../reader/theme';

interface ScanHeroCardProps {
  isProcessing: boolean;
  onTakePhoto: () => void;
  onPickGallery: () => void;
  onOpenSimulation: () => void;
  errorMessage?: string | null;
}

export function ScanHeroCard({
  isProcessing,
  onTakePhoto,
  onPickGallery,
  onOpenSimulation,
  errorMessage,
}: ScanHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Camera size={22} color={colors.primary} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Digitalización con IA</Text>
          <Text style={styles.subtitle}>
            Capturá la planilla física para extraer caravanas y datos automáticamente
          </Text>
        </View>
      </View>

      {errorMessage && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {isProcessing ? (
        <View style={styles.processingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>
            Analizando planilla con Inteligencia Artificial...
          </Text>
        </View>
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={onTakePhoto}
            activeOpacity={0.8}
          >
            <Camera size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Tomar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={onPickGallery}
            activeOpacity={0.8}
          >
            <Image size={18} color={colors.primaryDark} />
            <Text style={styles.secondaryBtnText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.simulationBtn]}
            onPress={onOpenSimulation}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#7C3AED" />
            <Text style={styles.simulationBtnText}>Simular</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    flex: 1.2,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  simulationBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    flex: 0.9,
  },
  simulationBtnText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '600',
  },
  processingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  processingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '500',
  },
});
