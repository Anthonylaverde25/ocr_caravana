import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bluetooth, Building2, Calendar, CheckCircle2, FileText, ShieldAlert, ShieldCheck, Tag, Truck } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';
import { Card } from '../ui/Card';
import { PillButton } from '../ui/PillButton';
import { StatusPill, StatusTone } from '../ui/StatusPill';
import { CLOSED_STATUSES, DteDisplayItem } from './dteItems';

interface DteOrderCardProps {
  item: DteDisplayItem;
  onQuickCount: (item: DteDisplayItem) => void;
  onReceiveWithCaravans: (item: DteDisplayItem, mode: 'receive' | 'identify') => void;
  onScanSheet: (item: DteDisplayItem) => void;
  onOpenReader: (item: DteDisplayItem) => void;
}

function statusTone(item: DteDisplayItem): StatusTone {
  if (item.status === 'IN_TRANSIT') return 'info';
  if (CLOSED_STATUSES.includes(item.status)) return 'success';
  if (item.status === 'RECEIVED') return 'warning';
  return 'neutral';
}

export function DteOrderCard({ item, onQuickCount, onReceiveWithCaravans, onScanSheet, onOpenReader }: DteOrderCardProps) {
  const hasPending = item.pending_heads > 0 && item.order.accepts_reception;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.dte}>
          {item.hasDte ? <ShieldCheck size={15} color={colors.primary} /> : <ShieldAlert size={15} color={colors.warning} />}
          <Text style={[styles.dteText, !item.hasDte && styles.dteTextPending]} numberOfLines={1}>
            {item.dte_number || 'DTe pendiente'}
          </Text>
        </View>
        <StatusPill label={item.status_label} tone={statusTone(item)} />
      </View>

      <View style={styles.body}>
        <Text style={styles.code}>{item.code}</Text>
        <View style={styles.metaRow}>
          <Building2 size={13} color={colors.muted} />
          <Text style={styles.meta} numberOfLines={1}>{item.provider_name || 'Sin proveedor asignado'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Calendar size={13} color={colors.muted} />
          <Text style={styles.meta}>{item.date}</Text>
          {item.batch_name ? <Text style={styles.meta} numberOfLines={1}>· Destino: {item.batch_name}</Text> : null}
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Declaradas" value={item.planned_heads} />
        <Metric label="Recibidas" value={item.heads_received} />
        <Metric label="En tránsito" value={hasPending ? item.pending_heads : 0} accent={hasPending} />
      </View>

      {!item.hasDte ? (
        <View style={[styles.banner, styles.bannerWarning]}>
          <ShieldAlert size={15} color={colors.warningText} />
          <Text style={[styles.bannerText, { color: colors.warningText }]}>DTe pendiente de carga en el sistema web</Text>
        </View>
      ) : hasPending ? (
        <View style={styles.actions}>
          <PillButton label="Conteo" icon={Truck} variant="soft" style={styles.countButton} onPress={() => onQuickCount(item)} />
          <PillButton
            label={`Recibir (${item.pending_heads})`}
            icon={Tag}
            style={styles.flex}
            onPress={() => onReceiveWithCaravans(item, 'receive')}
          />
        </View>
      ) : item.uncaravaned > 0 ? (
        <PillButton label={`Cargar caravanas (${item.uncaravaned})`} icon={Tag} onPress={() => onReceiveWithCaravans(item, 'identify')} />
      ) : (
        <View style={[styles.banner, styles.bannerSuccess]}>
          <CheckCircle2 size={15} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>
            Arribo registrado · {item.heads_received} cabezas ingresadas
          </Text>
        </View>
      )}

      <View style={styles.utilities}>
        <TouchableOpacity style={styles.utility} onPress={() => onScanSheet(item)} activeOpacity={0.7}>
          <FileText size={14} color={colors.textSecondary} />
          <Text style={styles.utilityText}>Planilla ING-02/03</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.utility} onPress={() => onOpenReader(item)} activeOpacity={0.7}>
          <Bluetooth size={14} color={colors.textSecondary} />
          <Text style={styles.utilityText}>Manga BLE</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && styles.metricAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dte: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  dteText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  dteTextPending: { color: colors.warningText },
  body: { gap: 4 },
  code: { fontFamily: fonts.semibold, fontSize: 19, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, flexShrink: 1 },
  metrics: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  metric: { flex: 1, gap: 2 },
  metricLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  metricValue: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  metricAccent: { color: colors.primary },
  actions: { flexDirection: 'row', gap: 10 },
  countButton: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md },
  bannerWarning: { backgroundColor: colors.warningBg },
  bannerSuccess: { backgroundColor: colors.successBg },
  bannerText: { flex: 1, fontFamily: fonts.medium, fontSize: 13 },
  utilities: { flexDirection: 'row', gap: 8 },
  utility: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  utilityText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
});
