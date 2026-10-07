import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Truck, X, AlertTriangle, Calendar, Check, CheckCircle2 } from 'lucide-react-native';
import { colors, fonts, radius, shadow } from '../../reader/theme';
import { PillButton } from '../ui/PillButton';
import { EntryOrderApi, EntryOrderDteSummary, receptionErrorsOf } from '../../../infrastructure/api/EntryOrderApi';
import { errorMessage } from '../../../infrastructure/api/ApiClient';
import { localDateString } from '../../../core/entry-orders/reception';

export interface ReceiveDteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: number;
  orderCode: string;
  dte: EntryOrderDteSummary | null;
  providerName?: string | null;
  batchName?: string | null;
}

export function ReceiveDteModal({
  visible,
  onClose,
  onSuccess,
  orderId,
  orderCode,
  dte,
  providerName,
  batchName,
}: ReceiveDteModalProps) {
  const [receivedAt, setReceivedAt] = useState(localDateString());
  const [receivedHeads, setReceivedHeads] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = dte ? dte.pending_count : 0;
  const parsedReceived = parseInt(receivedHeads, 10);
  const isReceivedValid = !isNaN(parsedReceived) && parsedReceived >= 0;
  const missingCount = isReceivedValid && parsedReceived < pendingCount ? pendingCount - parsedReceived : 0;
  const hasIncident = missingCount > 0;

  useEffect(() => {
    if (dte) {
      setReceivedAt(localDateString());
      setReceivedHeads(String(dte.pending_count));
      setReason('');
      setError(null);
    }
  }, [dte, visible]);

  if (!dte) return null;

  const handleSubmit = async () => {
    if (!isReceivedValid) {
      setError('Ingresá una cantidad válida de cabezas.');
      return;
    }

    if (hasIncident && !reason.trim()) {
      setError('Debes ingresar el motivo del faltante para registrar la novedad.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await EntryOrderApi.receive(orderId, {
        method: 'MANUAL',
        received_at: receivedAt,
        dte_id: dte.id,
        received_head_count: parsedReceived,
        reason: hasIncident ? reason.trim() : null,
        animals: [],
      });

      Alert.alert(
        'Ingreso registrado',
        `Se registraron ${parsedReceived} cabezas del DTE ${dte.dte_number}.`,
        [{ text: 'Aceptar', onPress: () => { onSuccess(); onClose(); } }]
      );
    } catch (err) {
      setError(receptionErrorsOf(err).message ?? errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBadge}>
                <Truck size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Ingresar DTE</Text>
                <Text style={styles.subtitle}>{dte.dte_number}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeBtn}>
              <X size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Context Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Orden: </Text>
                <Text style={styles.infoValue}>{orderCode}</Text>
              </Text>
              {batchName && (
                <Text style={styles.infoLine}>
                  <Text style={styles.infoLabel}>Lote destino: </Text>
                  <Text style={styles.infoValue}>{batchName}</Text>
                </Text>
              )}
              {providerName && (
                <Text style={styles.infoLine}>
                  <Text style={styles.infoLabel}>Proveedor: </Text>
                  <Text style={styles.infoValue}>{providerName}</Text>
                </Text>
              )}
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Declaradas en tránsito: </Text>
                <Text style={styles.infoValueBold}>{pendingCount} cabezas</Text>
              </Text>
            </View>

            {/* Fecha de recepción */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Fecha de arribo (AAAA-MM-DD)</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={18} color={colors.muted} />
                <TextInput
                  style={styles.inputInner}
                  value={receivedAt}
                  onChangeText={setReceivedAt}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.subtle}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* Cabezas recibidas */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Cabezas recibidas físicamente</Text>
              <TextInput
                style={styles.numberInput}
                value={receivedHeads}
                onChangeText={setReceivedHeads}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.subtle}
              />
              <Text style={styles.fieldHelper}>
                Confirmá el recuento del camión. Las cabezas ingresan al establecimiento.
              </Text>
            </View>

            {/* Alerta de faltante / novedad */}
            {hasIncident && (
              <View style={styles.incidentBox}>
                <View style={styles.incidentTitleRow}>
                  <AlertTriangle size={18} color={colors.warning} />
                  <Text style={styles.incidentTitle}>
                    Faltante detectado: {missingCount} {missingCount === 1 ? 'cabeza' : 'cabezas'}
                  </Text>
                </View>
                <Text style={styles.incidentDesc}>
                  Se generará una novedad de recepción por la diferencia. Especificá el motivo acordado con el transportista/remitente.
                </Text>
                <TextInput
                  style={styles.reasonInput}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Motivo del faltante (ej. quedó en origen, mortandad en viaje...)"
                  placeholderTextColor={colors.subtle}
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}

            {isReceivedValid && !hasIncident && (
              <View style={styles.matchBox}>
                <CheckCircle2 size={16} color={colors.primary} />
                <Text style={styles.matchText}>
                  Coincidencia exacta con el DTE ({parsedReceived} cabezas).
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <PillButton label="Cancelar" variant="soft" style={styles.cancelBtn} disabled={loading} onPress={onClose} />
            <PillButton label="Confirmar ingreso" icon={Check} loading={loading} style={styles.confirmBtn} onPress={handleSubmit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    ...shadow.raised,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    padding: 18,
  },
  infoBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    marginBottom: 16,
  },
  infoLine: {
    fontFamily: fonts.regular, fontSize: 12.5,
    color: colors.textSecondary,
  },
  infoLabel: {
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  infoValue: {
    fontFamily: fonts.medium,
    color: colors.text,
  },
  infoValueBold: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  formGroup: {
    marginBottom: 16,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
  },
  fieldHelper: {
    fontFamily: fonts.regular, fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  inputInner: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.medium,
  },
  numberInput: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  incidentBox: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  incidentTitle: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.warningText,
  },
  incidentDesc: {
    fontFamily: fonts.regular, fontSize: 11.5,
    color: colors.warningText,
    lineHeight: 15,
  },
  reasonInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.warningBg,
    borderRadius: radius.sm,
    padding: 8,
    fontFamily: fonts.regular, fontSize: 12.5,
    color: colors.text,
    minHeight: 52,
    textAlignVertical: 'top',
  },
  matchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    padding: 10,
    borderRadius: radius.md,
    gap: 8,
    marginBottom: 14,
  },
  matchText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.primaryDark,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: 10,
  },
  cancelBtn: { paddingHorizontal: 18 },
  confirmBtn: { flex: 1 },
});
