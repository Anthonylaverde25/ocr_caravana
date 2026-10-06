import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { colors } from '../../../reader/theme';
import type { SheetModule, SheetRow, SheetValues } from '../../../../core/work-templates/sheet/types';

interface ReviewRowEditModalProps {
  module: SheetModule;
  row: SheetRow | null;
  onSave: (row: SheetRow) => void;
  onClose: () => void;
}

/** Edits one row with the fields of its template: text, numbers, dates, or a choice in one tap. */
export function ReviewRowEditModal({ module, row, onSave, onClose }: ReviewRowEditModalProps) {
  const [values, setValues] = useState<SheetValues>({});

  useEffect(() => setValues(row?.values ?? {}), [row]);

  if (!row) return null;

  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{row.pageKey === 'manual' && !row.values[module.rowTitleKey] ? 'Agregar renglón' : 'Editar renglón'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {module.rowFields.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              {field.kind === 'choice' && field.options ? (
                <View style={styles.choices}>
                  {field.options.map((option) => {
                    const active = (values[field.key] ?? '') === option.value;

                    return (
                      <TouchableOpacity key={option.value || 'none'} style={[styles.choice, active && styles.choiceActive]} onPress={() => set(field.key, option.value)}>
                        <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={values[field.key] ?? ''}
                  onChangeText={(value) => set(field.key, field.upper ? value.toUpperCase() : value)}
                  placeholder={field.kind === 'date' ? 'AAAA-MM-DD' : field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={field.kind === 'number' ? 'decimal-pad' : 'default'}
                  autoCapitalize={field.upper ? 'characters' : 'sentences'}
                />
              )}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.save}
          onPress={() => {
            onSave({ ...row, values });
            onClose();
          }}
        >
          <Check size={18} color="#FFFFFF" />
          <Text style={styles.saveText}>Guardar renglón</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { padding: 16, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  input: { backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.text },
  choices: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  choice: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.background },
  choiceActive: { backgroundColor: colors.primary },
  choiceText: { fontSize: 14, color: colors.text },
  choiceTextActive: { color: '#FFFFFF', fontWeight: '600' },
  save: { margin: 16, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
