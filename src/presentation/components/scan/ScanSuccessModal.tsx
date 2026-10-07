import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { CheckCircle, ArrowRight, RotateCcw } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';

interface ScanSuccessModalProps {
  visible: boolean;
  templateCode: string;
  templateTitle: string;
  persistedCount: number;
  batchName?: string;
  onScanAnother: () => void;
  onGoToOperations: () => void;
}

export function ScanSuccessModal({
  visible,
  templateCode,
  templateTitle,
  persistedCount,
  batchName,
  onScanAnother,
  onGoToOperations,
}: ScanSuccessModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <CheckCircle size={48} color={colors.primary} />
            </View>

            <Text style={styles.title}>¡Planilla Procesada!</Text>
            <Text style={styles.subtitle}>
              La información fue verificada y guardada exitosamente en el sistema ganadero.
            </Text>

            <View style={styles.statsBox}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{templateCode}</Text>
                <Text style={styles.statLabel}>Código</Text>
              </View>

              <View style={[styles.statItem, styles.statDivider]}>
                <Text style={styles.statValue}>{persistedCount}</Text>
                <Text style={styles.statLabel}>Animales</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue} numberOfLines={1}>
                  {batchName || 'General'}
                </Text>
                <Text style={styles.statLabel}>Lote</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.primaryBtn]}
                onPress={onScanAnother}
                activeOpacity={0.8}
              >
                <RotateCcw size={18} color={colors.surface} />
                <Text style={styles.primaryBtnText}>Escanear Otra Planilla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.secondaryBtn]}
                onPress={onGoToOperations}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>Ir a Operaciones</Text>
                <ArrowRight size={18} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular, fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    color: colors.surface,
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryBtnText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
});
