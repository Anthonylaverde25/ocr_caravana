import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { colors, common, radius } from '../theme';

export interface Option {
  id: number;
  label: string;
  detail?: string | null;
}

interface Props {
  label: string;
  placeholder: string;
  options: Option[];
  value: number | null;
  onChange(id: number | null): void;
  optional?: boolean;
}

export function OptionPicker({ label, placeholder, options, value, onChange, optional }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View style={{ gap: 6 }}>
      <Text style={common.label}>{label}{optional ? ' (opcional)' : ''}</Text>
      <TouchableOpacity style={[common.input, styles.field]} onPress={() => setOpen(true)}>
        <Text style={selected ? common.body : common.muted} numberOfLines={1}>{selected?.label ?? placeholder}</Text>
        <ChevronDown size={18} color={colors.muted} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={[common.screen, { paddingTop: 12 }]}>
          <View style={[common.row, styles.header]}>
            <Text style={common.title}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12} style={styles.close} accessibilityLabel="Cerrar">
              <X size={18} color={colors.text} />
            </Pressable>
          </View>
          <FlatList
            data={optional ? [{ id: -1, label: 'Ninguno' }, ...options] : options}
            keyExtractor={(o) => String(o.id)}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item.id === value && styles.active]}
                onPress={() => { onChange(item.id === -1 ? null : item.id); setOpen(false); }}
              >
                <Text style={common.body}>{item.label}</Text>
                {item.detail ? <Text style={common.muted}>{item.detail}</Text> : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={common.muted}>No hay opciones cargadas.</Text>}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { justifyContent: 'space-between', paddingHorizontal: 16 },
  close: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle,
  },
  option: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 2,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  active: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryBg },
});
