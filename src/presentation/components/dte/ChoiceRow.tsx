import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import type { Choice } from '../../../core/entry-orders/reception';
import { colors, fonts, radius } from '../../reader/theme';

interface ChoiceRowProps<T extends string | number> {
  label: string;
  choice: Choice<T>;
  /** Marked when the caravan still has to say it. */
  missing: boolean;
  onPick: (value: T | null) => void;
}

/**
 * One datum of a caravan: what the order fixes, grey with a lock; what it leaves open, a pill per
 * option — tapping the chosen one again clears it.
 */
export function ChoiceRow<T extends string | number>({ label, choice, missing, onPick }: ChoiceRowProps<T>) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, missing && styles.labelMissing]}>{label}</Text>
      {choice.kind === 'fixed' ? (
        <View style={styles.fixed}>
          <Lock size={11} color={colors.muted} />
          <Text style={styles.fixedText}>{choice.label}</Text>
        </View>
      ) : (
        <View style={styles.options}>
          {choice.options.map((option) => {
            const active = option.value === choice.value;

            return (
              <TouchableOpacity
                key={String(option.value)}
                style={[styles.pill, active && styles.pillActive, missing && !active && styles.pillMissing]}
                onPress={() => onPick(active ? null : option.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 30 },
  label: { width: 68, fontSize: 11, fontFamily: fonts.semibold, color: colors.muted },
  labelMissing: { color: colors.danger },
  fixed: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  fixedText: { fontSize: 13, color: colors.muted, fontFamily: fonts.medium },
  options: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surface },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillMissing: { borderColor: colors.danger },
  pillText: { fontSize: 13, color: colors.text, fontFamily: fonts.medium },
  pillTextActive: { color: colors.surface },
});
