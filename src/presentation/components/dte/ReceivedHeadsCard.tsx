import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Info, Minus, Plus, Truck } from 'lucide-react-native';
import { colors, fonts, radius, shadow } from '../../reader/theme';

export interface ReceivedHeadsCardProps {
  /** Expected head in transit declared by the DTE. */
  expected: number;
  /** Current string value of the arrived head count. */
  receivedHeads: string;
  /** Callback when the count changes. */
  onChangeHeads: (value: string) => void;
  /** Justification reason if there is a head discrepancy. */
  reason: string;
  /** Callback when reason changes. */
  onChangeReason: (value: string) => void;
  /** Optional error message from validation. */
  error?: string | null;
}

/**
 * Physical arrival head count card: allows the operator to specify how many animals
 * stepped off the transport truck (defaulting to transit expected count), with quick stepper
 * controls and live reconciliation against SENASA DTE figures.
 */
export const ReceivedHeadsCard: React.FC<ReceivedHeadsCardProps> = ({
  expected,
  receivedHeads,
  onChangeHeads,
  reason,
  onChangeReason,
  error,
}) => {
  const parsed = parseInt(receivedHeads, 10);
  const isValidNumber = !isNaN(parsed) && parsed >= 0;
  const difference = isValidNumber ? parsed - expected : null;

  const handleDecrement = () => {
    const current = isValidNumber ? parsed : expected;
    if (current > 0) {
      onChangeHeads(String(current - 1));
    }
  };

  const handleIncrement = () => {
    const current = isValidNumber ? parsed : expected;
    onChangeHeads(String(current + 1));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Truck size={16} color={colors.primary} />
          <Text style={styles.title}>Conteo de cabezas arribadas</Text>
        </View>
        <Text style={styles.expectedBadge}>{expected} en DTE</Text>
      </View>

      <Text style={styles.subtitle}>
        Confirmá las cabezas físicas que bajaron del camión para cerrar el DTE.
      </Text>

      {/* Stepper & input controls */}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={[styles.stepperBtn, (!isValidNumber || parsed <= 0) && styles.stepperBtnDisabled]}
          onPress={handleDecrement}
          disabled={!isValidNumber || parsed <= 0}
          activeOpacity={0.7}
        >
          <Minus size={18} color={!isValidNumber || parsed <= 0 ? colors.muted : colors.text} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.numericInput, error ? styles.numericInputError : null]}
            value={receivedHeads}
            onChangeText={(text) => onChangeHeads(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            textAlign="center"
          />
          <Text style={styles.inputUnit}>cabezas arribadas</Text>
        </View>

        <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrement} activeOpacity={0.7}>
          <Plus size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Live reconciliation alert */}
      {difference !== null && (
        <View style={styles.alertContainer}>
          {difference === 0 ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color={colors.success} style={styles.alertIcon} />
              <Text style={styles.successText}>
                Coincide con el DTE: se reciben las {parsed} cabezas declaradas.
              </Text>
            </View>
          ) : difference < 0 ? (
            <View style={styles.warningBox}>
              <View style={styles.alertTitleRow}>
                <AlertTriangle size={16} color={colors.warning} style={styles.alertIcon} />
                <Text style={styles.warningTitle}>
                  Faltan {Math.abs(difference)} {Math.abs(difference) === 1 ? 'cabeza' : 'cabezas'}: el DTE se cierra con una novedad.
                </Text>
              </View>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={onChangeReason}
                placeholder="Motivo obligatorio del faltante (ej. murió en viaje)..."
                placeholderTextColor={colors.muted}
                multiline
              />
            </View>
          ) : (
            <View style={styles.infoBox}>
              <View style={styles.alertTitleRow}>
                <Info size={16} color={colors.info} style={styles.alertIcon} />
                <Text style={styles.infoTitle}>
                  {difference} {difference === 1 ? 'cabeza' : 'cabezas'} de más: se reciben con novedad de exceso de arribo.
                </Text>
              </View>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={onChangeReason}
                placeholder="Motivo u observación del exceso (opcional)..."
                placeholderTextColor={colors.muted}
                multiline
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    ...shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  expectedBadge: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.primaryDark,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  subtitle: {
    fontFamily: fonts.regular, fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
    backgroundColor: colors.background,
  },
  inputWrapper: {
    alignItems: 'center',
    minWidth: 120,
  },
  numericInput: {
    fontSize: 26,
    fontFamily: fonts.semibold,
    color: colors.text,
    paddingVertical: 2,
    minWidth: 80,
    textAlign: 'center',
  },
  numericInputError: {
    color: colors.danger,
  },
  inputUnit: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: fonts.medium,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontFamily: fonts.medium,
    marginTop: -4,
  },
  alertContainer: {
    marginTop: 2,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fonts.medium,
    flex: 1,
  },
  warningBox: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertIcon: {
    marginRight: 4,
  },
  warningTitle: {
    fontSize: 12,
    color: colors.warningText,
    fontFamily: fonts.semibold,
    flex: 1,
  },
  infoBox: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.info,
  },
  infoTitle: {
    fontSize: 12,
    color: colors.info,
    fontFamily: fonts.semibold,
    flex: 1,
  },
  reasonInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fonts.regular, fontSize: 13,
    color: colors.text,
    minHeight: 48,
    textAlignVertical: 'top',
  },
});
