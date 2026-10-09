import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { AnimalRecord, sexLabel } from '../../../core/caravans/AnimalRecord';
import { colors, fonts, formatEid, radius } from '../../reader/theme';

/** The caravan big, and the few facts that tell the animal apart at a glance. */
export function RecordHero({ record }: { record: AnimalRecord }) {
  const breed = [record.breedName, record.colorName].filter(Boolean).join(' · ');
  const tags = [record.categoryName, sexLabel(record.sex), breed || null].filter((t): t is string => Boolean(t));
  const place = [record.batchName, record.farmName && `Campo ${record.farmName}`].filter(Boolean).join(' · ');

  return (
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>Caravana electrónica</Text>
      <Text style={styles.eid}>{formatEid(record.identification)}</Text>
      <View style={styles.tags}>
        {record.physiological && (
          <View style={[styles.tag, styles.state]}>
            <Text style={[styles.tagText, styles.stateText]}>{record.physiological.label}</Text>
          </View>
        )}
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.place}>
        <MapPin size={16} color={colors.onPrimaryMuted} />
        <Text style={styles.placeText}>{place || 'Sin lote asignado'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  eyebrow: { fontFamily: fonts.regular, fontSize: 13, color: colors.onPrimaryMuted },
  eid: { fontFamily: fonts.semibold, fontSize: 30, lineHeight: 34, color: colors.onPrimary, fontVariant: ['tabular-nums'] },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimaryGlass,
    borderWidth: 1,
    borderColor: colors.onPrimaryGlassBorder,
  },
  tagText: { fontFamily: fonts.medium, fontSize: 13, color: colors.onPrimary },
  state: { backgroundColor: colors.surface, borderColor: colors.surface },
  stateText: { color: colors.primary },
  place: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.onPrimary },
});
