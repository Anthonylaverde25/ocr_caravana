import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Bluetooth, Plus } from 'lucide-react-native';
import { colors, fonts, radius, shadow } from '../../reader/theme';

interface CaravanEntryCardProps {
  /** Caravans read by the stick in the current chute session. */
  bleTags: string[];
  /** Adds a typed or pasted list; returns how many were new. */
  onAdd: (text: string) => number;
}

/** Where caravans come in: typed, pasted as a list, or brought from the BLE stick's session. */
export function CaravanEntryCard({ bleTags, onAdd }: CaravanEntryCardProps) {
  const [input, setInput] = useState('');
  const [note, setNote] = useState<string | null>(null);

  const add = () => {
    if (!input.trim()) return;

    const added = onAdd(input);
    setNote(added > 0 ? null : 'Esa caravana ya está en la lista.');
    if (added > 0) setInput('');
  };

  const importBle = () => {
    if (bleTags.length === 0) {
      Alert.alert('Bastón BLE', 'No hay lecturas registradas en la sesión actual de manga.');
      return;
    }

    const added = onAdd(bleTags.join(' '));
    Alert.alert('Caravanas importadas', `Se incorporaron ${added} caravanas leídas con el bastón.`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Identificación de animales</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="EID (15 dígitos) o caravana visual"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={add} activeOpacity={0.7}>
          <Plus size={18} color={colors.surface} />
          <Text style={styles.addText}>Agregar</Text>
        </TouchableOpacity>
      </View>
      <Text style={note ? styles.note : styles.helper}>{note ?? 'Podés pegar una lista separada por comas o espacios.'}</Text>
      {bleTags.length > 0 && (
        <TouchableOpacity style={styles.ble} onPress={importBle} activeOpacity={0.8}>
          <Bluetooth size={16} color={colors.primary} />
          <Text style={styles.bleText}>Traer {bleTags.length} lecturas del bastón</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, ...shadow.card },
  label: { fontSize: 16, fontFamily: fonts.semibold, color: colors.text },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 11, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 16 },
  addText: { color: colors.surface, fontFamily: fonts.semibold, fontSize: 14 },
  helper: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  note: { fontSize: 12, color: colors.warning, fontFamily: fonts.medium },
  ble: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryBg, borderRadius: radius.pill, minHeight: 46, paddingHorizontal: 16 },
  bleText: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 13 },
});
