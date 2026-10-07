import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, Save } from 'lucide-react-native';
import { colors, fonts, radius } from '../../../reader/theme';

interface ReviewConfirmBarProps {
  sentCount: number;
  errorCount: number;
  validating: boolean;
  current: boolean;
  saving: boolean;
  canRegister: boolean;
  onAddRow: () => void;
  onRegister: () => void;
}

/**
 * Where the sheet stands against the server and the button that registers it. "Registrar" only
 * works once the last check describes the sheet as it is and found no errors; tapped before, it is
 * explained, not silently disabled.
 */
export function ReviewConfirmBar({ sentCount, errorCount, validating, current, saving, canRegister, onAddRow, onRegister }: ReviewConfirmBarProps) {
  const status = validating
    ? 'Validando con el sistema…'
    : !current
      ? 'Cambios sin validar'
      : errorCount > 0
        ? `${errorCount} ${errorCount === 1 ? 'error' : 'errores'} para corregir`
        : 'Lista para registrar';

  return (
    <View style={styles.bar}>
      <View style={styles.info}>
        <Text style={styles.count}>
          {sentCount} {sentCount === 1 ? 'renglón' : 'renglones'}
        </Text>
        <View style={styles.statusRow}>
          {validating && <ActivityIndicator size="small" color={colors.primary} />}
          <Text style={[styles.status, errorCount > 0 && current && styles.statusError]}>{status}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.add} onPress={onAddRow} disabled={saving}>
        <Plus size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.save, !canRegister && styles.saveDim]} onPress={onRegister} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <>
            <Save size={17} color={colors.surface} />
            <Text style={styles.saveText}>Registrar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  info: { flex: 1, gap: 2 },
  count: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  status: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  statusError: { color: colors.danger, fontFamily: fonts.medium },
  add: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 11 },
  save: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12 },
  saveDim: { opacity: 0.55 },
  saveText: { color: colors.surface, fontSize: 15, fontFamily: fonts.semibold },
});
