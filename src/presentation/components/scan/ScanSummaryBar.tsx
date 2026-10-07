import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Plus, Save } from 'lucide-react-native';
import { colors, fonts } from '../../reader/theme';
import { ActionBar } from '../ui/ActionBar';
import { PillButton } from '../ui/PillButton';

interface ScanSummaryBarProps {
  totalRows: number;
  isSaving: boolean;
  onAddRow: () => void;
  onSave: () => void;
}

export function ScanSummaryBar({ totalRows, isSaving, onAddRow, onSave }: ScanSummaryBarProps) {
  return (
    <ActionBar>
      <View style={styles.row}>
        <View style={styles.count}>
          <Text style={styles.countText}>{totalRows}</Text>
          <Text style={styles.label}>{totalRows === 1 ? 'animal' : 'animales'}</Text>
        </View>
        <PillButton label="Fila" icon={Plus} variant="soft" style={styles.add} disabled={isSaving} onPress={onAddRow} />
        <PillButton
          label="Guardar"
          icon={Save}
          style={styles.save}
          loading={isSaving}
          disabled={totalRows === 0}
          onPress={onSave}
        />
      </View>
    </ActionBar>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { alignItems: 'center', minWidth: 56 },
  countText: { fontFamily: fonts.semibold, fontSize: 24, color: colors.text },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  add: { paddingHorizontal: 16 },
  save: { flex: 1 },
});
