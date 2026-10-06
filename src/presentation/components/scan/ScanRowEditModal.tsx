import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { colors } from '../../reader/theme';
import { WorkTemplateScanRow, WorkTemplateCode } from '../../../core/work-templates/types';

interface ScanRowEditModalProps {
  visible: boolean;
  row: WorkTemplateScanRow | null;
  templateCode: WorkTemplateCode;
  onSave: (row: WorkTemplateScanRow) => void;
  onClose: () => void;
}

export function ScanRowEditModal({
  visible,
  row,
  templateCode,
  onSave,
  onClose,
}: ScanRowEditModalProps) {
  const [caravana, setCaravana] = useState('');
  const [category, setCategory] = useState('');
  const [sex, setSex] = useState('M');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [ceCm, setCeCm] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (row) {
      setCaravana(row.caravana || '');
      setCategory(row.category || '');
      setSex(row.sex || 'M');
      setBreed(row.breed || '');
      setWeight(row.entry_weight !== undefined ? String(row.entry_weight) : '');
      setCeCm(row.ce_cm !== undefined ? String(row.ce_cm) : '');
      setObservations(row.observations || '');
    } else {
      setCaravana('');
      setCategory('');
      setSex('M');
      setBreed('');
      setWeight('');
      setCeCm('');
      setObservations('');
    }
  }, [row, visible]);

  const handleConfirm = () => {
    if (!caravana.trim()) return;

    const updatedRow: WorkTemplateScanRow = {
      id: row ? row.id : `manual-${Date.now()}`,
      caravana: caravana.trim(),
      category: category.trim() || undefined,
      sex: sex || undefined,
      breed: breed.trim() || undefined,
      entry_weight: weight.trim() ? parseFloat(weight) : undefined,
      ce_cm: ceCm.trim() ? parseFloat(ceCm) : undefined,
      observations: observations.trim() || undefined,
      confidence: row ? row.confidence : 1.0,
      hasWarning: false,
    };

    onSave(updatedRow);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{row ? 'Editar Animal' : 'Agregar Animal'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.fieldBox}>
            <Text style={styles.label}>Caravana / Identificación *</Text>
            <TextInput
              style={styles.input}
              value={caravana}
              onChangeText={setCaravana}
              placeholder="Ej. 085401928374615"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.label}>Categoría Zootécnica</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Ej. Novillito, Vaquillona, Ternero"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.label}>Sexo</Text>
            <View style={styles.sexSelector}>
              <TouchableOpacity
                style={[styles.sexBtn, sex === 'M' && styles.sexBtnActive]}
                onPress={() => setSex('M')}
              >
                <Text style={[styles.sexBtnText, sex === 'M' && styles.sexBtnTextActive]}>
                  Macho (M)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sexBtn, sex === 'H' && styles.sexBtnActive]}
                onPress={() => setSex('H')}
              >
                <Text style={[styles.sexBtnText, sex === 'H' && styles.sexBtnTextActive]}>
                  Hembra (H)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.label}>Raza / Pelaje</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="Ej. Angus Colorado, Braford"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {templateCode === 'TOR-01' ? (
            <View style={styles.fieldBox}>
              <Text style={styles.label}>Circunferencia Escrotal (cm)</Text>
              <TextInput
                style={styles.input}
                value={ceCm}
                onChangeText={setCeCm}
                placeholder="Ej. 38.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>
          ) : (
            <View style={styles.fieldBox}>
              <Text style={styles.label}>Peso Actual (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Ej. 340.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>
          )}

          <View style={styles.fieldBox}>
            <Text style={styles.label}>Observaciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={observations}
              onChangeText={setObservations}
              placeholder="Detalles sanitarios, aplomos, marcas..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, !caravana.trim() && styles.saveBtnDisabled]}
            onPress={handleConfirm}
            disabled={!caravana.trim()}
          >
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Guardar Animal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  fieldBox: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sexSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  sexBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  sexBtnActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  sexBtnText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  sexBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
