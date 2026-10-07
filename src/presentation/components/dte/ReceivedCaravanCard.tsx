import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, Check, Lock, Trash2 } from 'lucide-react-native';
import { ReceptionCaravan, ReceptionTroop, caravanChoices, missingOf } from '../../../core/entry-orders/reception';
import { colors, fonts, radius } from '../../reader/theme';
import { ChoiceRow } from './ChoiceRow';
import type { CaravanReception } from './useCaravanReception';

interface ReceivedCaravanCardProps {
  index: number;
  caravan: ReceptionCaravan;
  troop: ReceptionTroop;
  /** Mark what is missing (after the first attempt to send). */
  showMissing: boolean;
  serverErrors: string[];
  actions: CaravanReception['actions'];
}

/**
 * One animal that arrived: its caravan, and its sex, category, breed and coat — like a line of
 * the ING-03 and a row of the web reception. Fixed troop fields are shown as compact badges,
 * while variable fields render interactive choice rows.
 */
export function ReceivedCaravanCard({ index, caravan, troop, showMissing, serverErrors, actions }: ReceivedCaravanCardProps) {
  const choices = caravanChoices(troop, caravan);
  const missing = showMissing ? missingOf(troop, caravan) : [];
  const flagged = missing.length > 0 || serverErrors.length > 0;

  const isAllFixed =
    choices.sex.kind === 'fixed' &&
    choices.category.kind === 'fixed' &&
    choices.breed.kind === 'fixed' &&
    choices.coat.kind === 'fixed';

  const fixedBadges: string[] = [];
  if (choices.sex.kind === 'fixed' && choices.sex.label !== '—') fixedBadges.push(choices.sex.label);
  if (choices.category.kind === 'fixed' && choices.category.label !== '—') fixedBadges.push(choices.category.label);
  if (choices.breed.kind === 'fixed' && choices.breed.label !== 'Sin declarar') {
    const coat = choices.coat.kind === 'fixed' && choices.coat.label !== '—' ? ` ${choices.coat.label}` : '';
    fixedBadges.push(`${choices.breed.label}${coat}`);
  }

  return (
    <View style={[styles.card, flagged && styles.cardFlagged]}>
      <View style={styles.header}>
        <Text style={styles.index}>#{index + 1}</Text>
        <Text style={styles.tag}>{caravan.tag}</Text>
        {isAllFixed && (
          <View style={styles.autoBadge}>
            <Check size={11} color={colors.primary} />
            <Text style={styles.autoBadgeText}>Auto</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => actions.remove(caravan.tag)} hitSlop={8}>
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* If all fields are fixed: clean, compact inline badges */}
      {isAllFixed ? (
        <View style={styles.fixedBadgesRow}>
          {fixedBadges.map((badgeText, i) => (
            <View key={i} style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>{badgeText}</Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          {/* If some are fixed, show them in a subtle summary line */}
          {fixedBadges.length > 0 && (
            <View style={styles.fixedSummaryRow}>
              <Lock size={10} color={colors.muted} />
              <Text style={styles.fixedSummaryText}>{fixedBadges.join(' · ')}</Text>
            </View>
          )}

          {/* Only render ChoiceRow for fields that actually need to be chosen */}
          {choices.sex.kind === 'pick' && (
            <ChoiceRow label="Sexo" choice={choices.sex} missing={missing.includes('sexo')} onPick={(v) => actions.setSex(caravan.tag, v)} />
          )}
          {choices.category.kind === 'pick' && (
            <ChoiceRow label="Categoría" choice={choices.category} missing={missing.includes('categoría')} onPick={(v) => actions.setCategory(caravan.tag, v)} />
          )}
          {choices.breed.kind === 'pick' && (
            <ChoiceRow label="Raza" choice={choices.breed} missing={missing.includes('raza')} onPick={(v) => actions.setBreed(caravan.tag, v)} />
          )}
          {choices.coat.kind === 'pick' && (
            <ChoiceRow label="Pelaje" choice={choices.coat} missing={missing.includes('pelaje')} onPick={(v) => actions.setCoat(caravan.tag, v)} />
          )}
        </>
      )}

      {flagged && (
        <View style={styles.problem}>
          <AlertCircle size={13} color={colors.danger} />
          <Text style={styles.problemText}>{serverErrors.length > 0 ? serverErrors.join(' ') : `Falta: ${missing.join(', ')}.`}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderSubtle, padding: 14, gap: 8 },
  cardFlagged: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  index: { fontSize: 12, fontFamily: fonts.semibold, color: colors.muted },
  tag: { flex: 1, fontSize: 17, fontFamily: fonts.semibold, color: colors.text, fontVariant: ['tabular-nums'] },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  autoBadgeText: { fontSize: 10.5, fontFamily: fonts.semibold, color: colors.primary },
  fixedBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  fixedBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixedBadgeText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  fixedSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  fixedSummaryText: {
    fontSize: 11.5,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  problem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  problemText: { flex: 1, fontSize: 12, color: colors.danger, fontFamily: fonts.medium },
});

