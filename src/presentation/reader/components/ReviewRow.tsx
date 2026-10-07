import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { AnimalOverrides, ReviewItem, Sex } from '../../../core/entities/RegistrationSession';
import { colors, common, fonts, formatEid, radius } from '../theme';
import { ChipGroup } from './ChipGroup';
import { StatusChip } from './StatusChip';

interface Props {
  item: ReviewItem;
  editable: boolean;
  onChange(patch: AnimalOverrides): void;
  onRemove(): void;
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'M', label: 'Macho' },
  { value: 'H', label: 'Hembra' },
];

/** Controls sit on the cell itself: nothing to open, the reviewer fixes the row in place. */
export function ReviewRow({ item, editable, onChange, onRemove }: Props) {
  const flagged = item.issues.length > 0 && item.status !== 'unchecked';

  return (
    <View style={[common.card, flagged && styles.flagged, !item.willRegister && styles.excluded]}>
      <View style={[common.row, { justifyContent: 'space-between' }]}>
        <Text style={styles.eid}>{formatEid(item.eid)}</Text>
        <StatusChip status={item.status} />
      </View>

      {item.status === 'own_company' && <Text style={common.muted}>Ya está en el sistema: no se da de alta.</Text>}
      {item.status === 'other_company' && <Text style={common.muted}>Pertenece a otra empresa: es una transferencia, no un alta.</Text>}
      {item.warning && <Text style={[common.muted, { color: colors.warning }]}>{item.warning}</Text>}

      {item.willRegister && (
        <>
          <ChipGroup options={SEX_OPTIONS} value={item.sex} disabled={!editable} onChange={(sex) => onChange({ sex })} />
          <View style={[common.row, { justifyContent: 'space-between' }]}>
            <View style={common.row}>
              <Text style={common.muted}>Dientes</Text>
              <Stepper value={item.teeth} disabled={!editable} onChange={(teeth) => onChange({ teeth })} />
            </View>
            <View style={common.row}>
              <Text style={common.muted}>Peso</Text>
              <TextInput
                style={[common.input, styles.weight]}
                editable={editable}
                keyboardType="decimal-pad"
                placeholder="kg"
                defaultValue={item.entryWeight?.toString() ?? ''}
                onEndEditing={(e) => {
                  const kg = Number(e.nativeEvent.text.replace(',', '.'));
                  onChange({ entryWeight: e.nativeEvent.text.trim() === '' || Number.isNaN(kg) ? undefined : kg });
                }}
              />
            </View>
          </View>
        </>
      )}

      {item.issues.filter((i) => item.willRegister || !i.startsWith('Falta')).map((issue) => (
        <Text key={issue} style={styles.issue}>• {issue}</Text>
      ))}

      {editable && (
        <TouchableOpacity style={[common.row, styles.remove]} onPress={onRemove}>
          <Trash2 size={14} color={colors.danger} />
          <Text style={styles.removeText}>Quitar lectura</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/** Dentition goes by pairs: milk teeth (0), 2, 4, 6 and full mouth (8). */
function Stepper({ value, onChange, disabled }: { value: number; onChange(v: number): void; disabled: boolean }) {
  return (
    <View style={common.row}>
      <TouchableOpacity disabled={disabled || value <= 0} onPress={() => onChange(Math.max(0, value - 2))} style={styles.step}>
        <Minus size={16} color={colors.primary} />
      </TouchableOpacity>
      <Text style={[common.body, { minWidth: 20, textAlign: 'center' }]}>{value}</Text>
      <TouchableOpacity disabled={disabled || value >= 8} onPress={() => onChange(Math.min(8, value + 2))} style={styles.step}>
        <Plus size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  eid: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text, fontVariant: ['tabular-nums'] },
  flagged: { borderWidth: 1.5, borderColor: colors.danger },
  excluded: { opacity: 0.6 },
  issue: { fontFamily: fonts.regular, fontSize: 13, color: colors.danger },
  weight: { width: 84, paddingVertical: 8, textAlign: 'right' },
  step: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  remove: { alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill },
  removeText: { fontFamily: fonts.medium, color: colors.danger, fontSize: 13 },
});
