import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Building2, Info, TagIcon } from 'lucide-react-native';
import { colors, fonts, formatEid, radius, shadow } from '../../reader/theme';
import { Card } from '../ui/Card';

interface Props {
  eid: string;
  /** Registered by another company: shown without its data, which is theirs. */
  otherCompany: boolean;
  companyName: string;
}

export function NotRegistered({ eid, otherCompany, companyName }: Props) {
  const Icon = otherCompany ? Building2 : TagIcon;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.badge, otherCompany && styles.badgeOther]}>
          <Icon size={34} color={otherCompany ? colors.danger : colors.warningText} />
        </View>
        <Text style={styles.title}>{otherCompany ? 'Registrada en otra empresa' : 'Caravana sin registrar'}</Text>
        <Text style={styles.eid}>{formatEid(eid)}</Text>
        <Text style={styles.text}>
          {otherCompany
            ? 'Este animal pertenece a otra empresa del sistema. Sus datos no se muestran; para traerlo corresponde una transferencia, no un alta.'
            : `Esta caravana no está dada de alta en ${companyName}. Si el animal es nuevo, podés registrarlo desde la manga.`}
        </Text>
      </View>

      {!otherCompany && (
        <Card style={styles.info}>
          <View style={styles.infoIcon}><Info size={20} color={colors.primary} /></View>
          <View style={styles.infoBody}>
            <Text style={styles.infoTitle}>¿Puede ser de otra empresa?</Text>
            <Text style={styles.infoText}>
              Si estuviera registrada en otra empresa lo verías acá, sin sus datos: en ese caso corresponde una transferencia, no un alta.
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
    ...shadow.card,
  },
  badge: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.warningBg, alignItems: 'center', justifyContent: 'center' },
  badgeOther: { backgroundColor: colors.dangerBg },
  title: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text, textAlign: 'center' },
  eid: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', maxWidth: 300 },
  info: { flexDirection: 'row', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  infoBody: { flex: 1, gap: 2 },
  infoTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  infoText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
});
