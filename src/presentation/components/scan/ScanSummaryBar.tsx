import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, Check, Save } from 'lucide-react-native';
import { colors } from '../../reader/theme';

interface ScanSummaryBarProps {
  totalRows: number;
  isSaving: boolean;
  onAddRow: () => void;
  onSave: () => void;
}

export function ScanSummaryBar({
  totalRows,
  isSaving,
  onAddRow,
  onSave,
}: ScanSummaryBarProps) {
  const canSave = totalRows > 0 && !isSaving;

  return (
    <View style={styles.bar}>
      <View style={styles.leftInfo}>
        <Text style={styles.countText}>{totalRows}</Text>
        <Text style={styles.label}>{totalRows === 1 ? 'animal' : 'animales'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddRow}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Plus size={16} color="#374151" />
          <Text style={styles.addBtnText}>Fila</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={onSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  countText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
