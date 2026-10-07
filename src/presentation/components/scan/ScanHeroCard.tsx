import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, Image, Sparkles, AlertCircle, ScanText } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { PillButton } from '../ui/PillButton';

interface ScanHeroCardProps {
  isProcessing: boolean;
  onTakePhoto: () => void;
  onPickGallery: () => void;
  onOpenSimulation: () => void;
  errorMessage?: string | null;
}

/** Entry point of the sheet scanner, laid half on the green header like Home's session card. */
export function ScanHeroCard({ isProcessing, onTakePhoto, onPickGallery, onOpenSimulation, errorMessage }: ScanHeroCardProps) {
  return (
    <Card style={styles.card} padding={20}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <ScanText size={24} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Digitalización con IA</Text>
          <Text style={styles.subtitle}>
            Fotografiá la planilla en papel y extraemos las caravanas y los datos.
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
          <Text style={styles.processingText}>Analizando la planilla con IA…</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <PillButton label="Tomar foto" icon={Camera} onPress={onTakePhoto} />
          <View style={styles.secondaryRow}>
            <PillButton label="Galería" icon={Image} variant="soft" style={styles.flex} onPress={onPickGallery} />
            <PillButton label="Simular" icon={Sparkles} variant="soft" style={styles.flex} onPress={onOpenSimulation} />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, borderRadius: radius.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.semibold, fontSize: 19, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.dangerBg,
  },
  errorText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
  processingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryBg,
  },
  processingText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  actions: { gap: 10 },
  secondaryRow: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1, paddingHorizontal: 12 },
});
