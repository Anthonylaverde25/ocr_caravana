import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Lock, Sliders, Sparkles } from 'lucide-react-native';
import { ReceptionTroop } from '../../../core/entry-orders/reception';
import { TroopFieldInfo, troopDefaultsOf } from '../../../core/entry-orders/troopDefaults';
import { colors, fonts, radius, shadow } from '../../reader/theme';

interface TroopDefaultsCardProps {
  troop: ReceptionTroop;
}

export function TroopDefaultsCard({ troop }: TroopDefaultsCardProps) {
  const defaults = troopDefaultsOf(troop);

  const renderBadge = (label: string, field: TroopFieldInfo) => {
    const isFixed = field.mode === 'GLOBAL';

    return (
      <View style={[styles.badge, isFixed ? styles.badgeFixed : styles.badgeVariable]}>
        <View style={styles.badgeHeader}>
          {isFixed ? <Lock size={10} color={colors.primary} /> : <Sliders size={10} color={colors.warningText} />}
          <Text style={[styles.badgeLabel, isFixed ? styles.badgeLabelFixed : styles.badgeLabelVariable]}>
            {label}
          </Text>
        </View>
        <Text
          style={[styles.badgeValue, isFixed ? styles.badgeValueFixed : styles.badgeValueVariable]}
          numberOfLines={1}
        >
          {isFixed ? field.value : field.hint ?? 'Por caravana'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={styles.cardTitle}>Composición de la tropa (DTe)</Text>
        </View>
        <View style={[styles.statusPill, defaults.isHomogeneous ? styles.statusPillHomo : styles.statusPillHetero]}>
          <Text style={[styles.statusPillText, defaults.isHomogeneous ? styles.statusPillTextHomo : styles.statusPillTextHetero]}>
            {defaults.isHomogeneous ? '100% Homogénea' : 'Mixta / Variable'}
          </Text>
        </View>
      </View>

      {/* Row of 3 chips */}
      <View style={styles.badgesRow}>
        {renderBadge('Sexo', defaults.sex)}
        {renderBadge('Categoría', defaults.category)}
        {renderBadge('Raza / Pelaje', defaults.breed)}
      </View>

      {/* Contextual instruction */}
      <View style={[styles.noticeBanner, defaults.isHomogeneous ? styles.noticeHomo : styles.noticeHetero]}>
        {defaults.isHomogeneous ? (
          <CheckCircle2 size={13} color={colors.primary} />
        ) : (
          <Sliders size={13} color={colors.warningText} />
        )}
        <Text style={[styles.noticeText, defaults.isHomogeneous ? styles.noticeTextHomo : styles.noticeTextHetero]}>
          {defaults.isHomogeneous
            ? 'Los animales heredan sexo, categoría y raza automáticamente. Solo escaneá las caravanas.'
            : 'Completá los campos marcados por caravana según corresponda.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusPillHomo: {
    backgroundColor: colors.successBg,
  },
  statusPillHetero: {
    backgroundColor: colors.warningBg,
  },
  statusPillText: {
    fontSize: 10.5,
    fontFamily: fonts.semibold,
  },
  statusPillTextHomo: {
    color: colors.primary,
  },
  statusPillTextHetero: {
    color: colors.warningText,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderWidth: 1,
    gap: 2,
  },
  badgeFixed: {
    backgroundColor: colors.successBg,
    borderColor: colors.emeraldBorder,
  },
  badgeVariable: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBg,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeLabel: {
    fontSize: 10,
    fontFamily: fonts.semibold,
  },
  badgeLabelFixed: {
    color: colors.primary,
  },
  badgeLabelVariable: {
    color: colors.warningText,
  },
  badgeValue: {
    fontSize: 11.5,
    fontFamily: fonts.semibold,
  },
  badgeValueFixed: {
    color: colors.primaryDark,
  },
  badgeValueVariable: {
    color: colors.warningText,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  noticeHomo: {
    backgroundColor: colors.successBg,
  },
  noticeHetero: {
    backgroundColor: colors.warningBg,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fonts.medium,
    lineHeight: 15,
  },
  noticeTextHomo: {
    color: colors.primaryDark,
  },
  noticeTextHetero: {
    color: colors.warningText,
  },
});
