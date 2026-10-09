import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, Check, ListPlus } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { PillButton } from '../components/ui/PillButton';
import { StatusPill } from '../components/ui/StatusPill';
import { ActionBar } from '../components/ui/ActionBar';
import { CaravanEntryCard } from '../components/dte/CaravanEntryCard';
import { LiveReceptionSummaryCard } from '../components/dte/LiveReceptionSummaryCard';
import { ReceivedCaravanCard } from '../components/dte/ReceivedCaravanCard';
import { ReceivedHeadsCard } from '../components/dte/ReceivedHeadsCard';
import { TroopDefaultsCard } from '../components/dte/TroopDefaultsCard';
import { CaravanReceptionMode, useCaravanReception } from '../components/dte/useCaravanReception';
import { useReader } from '../reader/ReaderContext';
import { colors, fonts, radius, shadow } from '../reader/theme';
import type { EntryOrderDteSummary, EntryOrderSummary } from '../../infrastructure/api/EntryOrderApi';

export interface ReceiveWithCaravansRouteParams {
  order: EntryOrderSummary;
  dte: EntryOrderDteSummary;
  /** "receive": head in transit arrive with their caravans; "identify": caravans of head already received by count. */
  mode: CaravanReceptionMode;
}

/**
 * "Recibir y registrar caravanas" on a DTE: coordinates physical arrived head counting
 * with ear-tag identification in one comprehensive flow, matching the web application ergonomics.
 * On a DTE already received by count, "Cargar caravanas" identifies the heads left without one.
 */
export function ReceiveWithCaravansScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProp<{ params: ReceiveWithCaravansRouteParams }, 'params'>>();
  const { order, dte, mode } = params;
  const { session } = useReader();
  const reception = useCaravanReception(order, dte, mode);
  const identifying = mode === 'identify';

  const submit = async () => {
    if (!(await reception.submit())) return;

    Alert.alert(
      identifying ? 'Caravanas cargadas' : 'Recepción registrada',
      `Se registraron ${reception.caravans.length} animales del DTE ${dte.dte_number}.`,
      [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
    );
  };

  const totalHeadTarget = identifying ? reception.expected : (reception.parsedReceived ?? reception.expected);

  return (
    <View style={styles.screen}>
      <AppHeader
        title={identifying ? 'Cargar caravanas' : 'Recibir y registrar'}
        subtitle={`DTe ${dte.dte_number} · ${order.code}`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryTop}>
              <Text style={styles.code}>{order.code}</Text>
              <StatusPill
                label={identifying ? `${reception.expected} sin caravana` : `${reception.expected} en tránsito`}
                tone="warning"
              />
            </View>
            <Text style={styles.meta}>
              {order.provider?.name ?? 'Sin proveedor'}
              {order.batch_name ? ` · Lote ${order.batch_name}` : ''} · {dte.head_count} declaradas
            </Text>
            <View style={styles.dateRow}>
              <Calendar size={16} color={colors.muted} />
              <TextInput
                style={styles.dateInput}
                value={reception.receivedAt}
                onChangeText={reception.setReceivedAt}
                placeholder="AAAA-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          {/* 1. Conteo de cabezas arribadas (solo en modo receive) */}
          {!identifying && (
            <ReceivedHeadsCard
              expected={reception.expected}
              receivedHeads={reception.receivedHeads}
              onChangeHeads={reception.setReceivedHeads}
              reason={reception.reason}
              onChangeReason={reception.setReason}
              error={reception.error && reception.error.includes('cabezas') ? reception.error : null}
            />
          )}

          {/* 2. Resumen en vivo de la recepción */}
          <LiveReceptionSummaryCard
            receivedCount={identifying ? reception.expected : (reception.parsedReceived ?? 0)}
            caravansCount={reception.caravans.length}
            withoutCaravansCount={reception.withoutCaravans}
            incompleteCount={reception.incomplete}
          />

          {/* 3. Composición e indicaciones de la tropa (fijos y variables) */}
          <TroopDefaultsCard troop={reception.troop} />

          {/* 4. Entrada y lectura de caravanas (RFID BLE + Manual) */}
          <CaravanEntryCard bleTags={(session?.readings ?? []).map((r) => r.eid)} onAdd={reception.addTags} />

          {/* 5. Listado de Caravanas */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              Caravanas ({reception.caravans.length} / {totalHeadTarget})
            </Text>
            {reception.caravans.length > 0 && (
              <TouchableOpacity onPress={reception.actions.clear}>
                <Text style={styles.clear}>Limpiar todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {reception.caravans.length === 0 ? (
            <View style={styles.empty}>
              <ListPlus size={28} color={colors.muted} />
              <Text style={styles.emptyText}>Sin caravanas todavía. Agregalas arriba o traelas del bastón.</Text>
            </View>
          ) : (
            reception.caravans.map((caravan, index) => (
              <ReceivedCaravanCard
                key={caravan.tag}
                index={index}
                caravan={caravan}
                troop={reception.troop}
                showMissing={reception.showMissing}
                serverErrors={reception.serverErrors[caravan.tag] ?? []}
                actions={reception.actions}
              />
            ))
          )}

          {reception.error && <Text style={styles.error}>{reception.error}</Text>}
        </ScrollView>

        <ActionBar>
          <View style={styles.actions}>
            <PillButton label="Cancelar" variant="soft" style={styles.cancel} disabled={reception.loading} onPress={() => navigation.goBack()} />
            <PillButton
              label={
                identifying
                  ? `Cargar (${reception.caravans.length}/${reception.expected})`
                  : reception.withoutCaravans > 0
                  ? `Confirmar (${reception.caravans.length} id. · ${reception.withoutCaravans} sin car.)`
                  : `Confirmar (${reception.caravans.length})`
              }
              icon={Check}
              loading={reception.loading}
              style={styles.confirm}
              onPress={submit}
            />
          </View>
        </ActionBar>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  summary: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 8, ...shadow.card },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  code: { fontSize: 19, fontFamily: fonts.semibold, color: colors.text, fontVariant: ['tabular-nums'] },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  dateInput: { flex: 1, paddingVertical: 9, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  listTitle: { fontSize: 16, fontFamily: fonts.semibold, color: colors.text },
  clear: { fontSize: 13, color: colors.danger, fontFamily: fonts.medium },
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center' },
  error: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 13,
    backgroundColor: colors.dangerBg,
    padding: 10,
    borderRadius: radius.md,
  },
  actions: { flexDirection: 'row', gap: 10 },
  cancel: { paddingHorizontal: 18 },
  confirm: { flex: 1, paddingHorizontal: 14 },
});
