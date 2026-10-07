import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ChevronDown, ChevronUp, FileText, Calendar, Tag, ShieldCheck } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';
import { WorkTemplateContext, WorkTemplateCode } from '../../../core/work-templates/types';

interface ScanHeaderContextCardProps {
  templateCode: WorkTemplateCode;
  templateTitle: string;
  category: string;
  context: WorkTemplateContext;
  onContextChange: (updated: WorkTemplateContext) => void;
}

export function ScanHeaderContextCard({
  templateCode,
  templateTitle,
  category,
  context,
  onContextChange,
}: ScanHeaderContextCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (field: keyof WorkTemplateContext, value: string) => {
    onContextChange({
      ...context,
      [field]: value,
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{templateCode}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{category}</Text>
            </View>
          </View>
          <Text style={styles.templateTitle} numberOfLines={1}>
            {templateTitle}
          </Text>
        </View>

        <View style={styles.expandIconWrap}>
          {isExpanded ? (
            <ChevronUp size={20} color={colors.muted} />
          ) : (
            <ChevronDown size={20} color={colors.muted} />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.body}>
          <View style={styles.fieldsGrid}>
            {/* Lote / Batch Name */}
            <View style={styles.fieldBox}>
              <View style={styles.fieldLabelRow}>
                <Tag size={12} color={colors.muted} />
                <Text style={styles.fieldLabel}>Lote Asignado</Text>
              </View>
              <TextInput
                style={styles.input}
                value={context.batch_name || context.lote || ''}
                onChangeText={(val) => handleFieldChange('batch_name', val)}
                placeholder="Nombre de lote"
                placeholderTextColor={colors.subtle}
              />
            </View>

            {/* Fecha */}
            <View style={styles.fieldBox}>
              <View style={styles.fieldLabelRow}>
                <Calendar size={12} color={colors.muted} />
                <Text style={styles.fieldLabel}>Fecha de Trabajo</Text>
              </View>
              <TextInput
                style={styles.input}
                value={context.entry_date || context.evaluation_date || ''}
                onChangeText={(val) => handleFieldChange('entry_date', val)}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={colors.subtle}
              />
            </View>

            {/* DTE / Guía */}
            <View style={styles.fieldBox}>
              <View style={styles.fieldLabelRow}>
                <FileText size={12} color={colors.muted} />
                <Text style={styles.fieldLabel}>Guía / DTE</Text>
              </View>
              <TextInput
                style={styles.input}
                value={context.guia_dte || ''}
                onChangeText={(val) => handleFieldChange('guia_dte', val)}
                placeholder="Ej. DTE-004812"
                placeholderTextColor={colors.subtle}
              />
            </View>

            {/* CUIT / RENSPA o Veterinario según plantilla */}
            {templateCode === 'TOR-01' ? (
              <View style={styles.fieldBox}>
                <View style={styles.fieldLabelRow}>
                  <ShieldCheck size={12} color={colors.muted} />
                  <Text style={styles.fieldLabel}>Veterinario / Matrícula</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={context.veterinarian_name || ''}
                  onChangeText={(val) => handleFieldChange('veterinarian_name', val)}
                  placeholder="Dr. Nombre y Apellido"
                  placeholderTextColor={colors.subtle}
                />
              </View>
            ) : (
              <View style={styles.fieldBox}>
                <View style={styles.fieldLabelRow}>
                  <ShieldCheck size={12} color={colors.muted} />
                  <Text style={styles.fieldLabel}>CUIT Proveedor</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={context.provider_cuit || ''}
                  onChangeText={(val) => handleFieldChange('provider_cuit', val)}
                  placeholder="30-..."
                  placeholderTextColor={colors.subtle}
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.surfaceMuted,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontFamily: fonts.semibold,
  },
  categoryBadge: {
    backgroundColor: colors.infoBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.infoBg,
  },
  categoryBadgeText: {
    color: colors.info,
    fontSize: 10,
    fontFamily: fonts.semibold,
  },
  templateTitle: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  expandIconWrap: {
    padding: 4,
  },
  body: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fieldsGrid: {
    gap: 10,
  },
  fieldBox: {
    gap: 4,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: fonts.regular, fontSize: 13,
    color: colors.text,
  },
});
