import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { common } from '../theme';

interface Props<T extends string | number> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange(value: T): void;
  disabled?: boolean;
}

export function ChipGroup<T extends string | number>({ options, value, onChange, disabled }: Props<T>) {
  return (
    <View style={[common.row, { flexWrap: 'wrap' }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={String(o.value)}
            disabled={disabled}
            style={[common.chip, active && common.chipActive, disabled && common.buttonDisabled]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[common.chipText, active && common.chipTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
