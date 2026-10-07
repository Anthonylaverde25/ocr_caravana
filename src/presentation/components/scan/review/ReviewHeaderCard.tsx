import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../../reader/theme';
import type { SheetModule, SheetValues } from '../../../../core/work-templates/sheet/types';
import type { ReviewIssue } from '../../../../core/work-templates/sheet/feedback';

interface ReviewHeaderCardProps {
  module: SheetModule;
  header: SheetValues;
  errors: ReviewIssue[];
  locked: boolean;
  onChange: (key: string, value: string) => void;
}

/** The header of the sheet as read, editable. A field the server objected to is marked. */
export function ReviewHeaderCard({ module, header, errors, locked, onChange }: ReviewHeaderCardProps) {
  const fieldError = (key: string) => errors.find((e) => e.field === key)?.message;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.code}>{module.code}</Text>
        <Text style={styles.title}>{module.title}</Text>
      </View>
      {module.headerFields.map((field) => {
        const error = fieldError(field.key);

        return (
          <View key={field.key} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={header[field.key] ?? ''}
              editable={!locked}
              onChangeText={(value) => onChange(field.key, field.upper ? value.toUpperCase() : value)}
              placeholder={field.kind === 'date' ? 'AAAA-MM-DD' : field.placeholder}
              placeholderTextColor={colors.subtle}
              keyboardType={field.kind === 'number' ? 'decimal-pad' : 'default'}
              autoCapitalize={field.upper ? 'characters' : 'sentences'}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: { fontSize: 12, fontFamily: fonts.semibold, color: colors.primaryDark, backgroundColor: colors.primaryBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  title: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, flexShrink: 1 },
  field: { gap: 4 },
  label: { fontSize: 11, fontFamily: fonts.semibold, color: colors.muted },
  input: { backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 9, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  inputError: { borderWidth: 1, borderColor: colors.danger },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger },
});
