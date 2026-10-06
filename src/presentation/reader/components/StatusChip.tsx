import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LookupStatus } from '../../../core/entities/RegistrationSession';
import { colors } from '../theme';

const LOOK: Record<LookupStatus, { label: string; color: string; bg: string }> = {
  unchecked: { label: 'Sin verificar', color: colors.muted, bg: colors.background },
  not_found: { label: 'Nueva', color: colors.success, bg: colors.successBg },
  own_company: { label: 'Ya registrada', color: colors.warning, bg: colors.warningBg },
  other_company: { label: 'De otra empresa', color: colors.danger, bg: colors.dangerBg },
};

export function StatusChip({ status }: { status: LookupStatus }) {
  const look = LOOK[status];
  return (
    <View style={[styles.chip, { backgroundColor: look.bg }]}>
      <Text style={[styles.text, { color: look.color }]}>{look.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  text: { fontSize: 12, fontWeight: '600' },
});
