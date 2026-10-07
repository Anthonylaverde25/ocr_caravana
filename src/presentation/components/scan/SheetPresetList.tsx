import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';
import { SHEET_PRESETS } from '../../../core/work-templates/registry';
import type { SheetPreset } from '../../../core/work-templates/sheet/presets';

const SCENARIO_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  HAPPY_PATH: { text: 'Flujo válido', color: colors.primary, bg: colors.primaryBg },
  WARNING_FLOW: { text: 'Con avisos', color: colors.warningText, bg: colors.warningBg },
  REPAIR_FLOW: { text: 'Para reparar', color: colors.danger, bg: colors.dangerBg },
};

/**
 * The test sheets of the templates with a module, as `identify` would read them: they go through
 * the same review and dry run as a photo, against the test seeders.
 */
export function SheetPresetList({ onSelect }: { onSelect: (preset: SheetPreset) => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Planillas de prueba (validadas por el sistema)</Text>
      {SHEET_PRESETS.map((preset) => {
        const scenario = SCENARIO_LABEL[preset.scenario];

        return (
          <TouchableOpacity key={`${preset.code}-${preset.fileName}`} style={styles.card} onPress={() => onSelect(preset)} activeOpacity={0.7}>
            <View style={styles.left}>
              <View style={styles.badges}>
                <Text style={styles.code}>{preset.code}</Text>
                <Text style={[styles.scenario, { color: scenario.color, backgroundColor: scenario.bg }]}>{scenario.text}</Text>
              </View>
              <Text style={styles.title}>{preset.label}</Text>
              <Text style={styles.description}>{preset.description}</Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  section: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  left: { flex: 1, gap: 4 },
  badges: { flexDirection: 'row', gap: 6 },
  code: { fontSize: 11, fontFamily: fonts.semibold, color: colors.primaryDark, backgroundColor: colors.primaryBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  scenario: { fontSize: 11, fontFamily: fonts.semibold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  title: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  description: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, lineHeight: 16 },
});
