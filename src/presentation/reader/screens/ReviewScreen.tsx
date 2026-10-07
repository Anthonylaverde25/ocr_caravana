import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCheck, Plus, RefreshCw, ScanLine } from 'lucide-react-native';
import * as S from '../../../core/entities/RegistrationSession';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/ui/PillButton';
import { StatsCard } from '../../components/ui/StatsCard';
import { ActionBar } from '../../components/ui/ActionBar';
import { ReviewRow } from '../components/ReviewRow';
import { SubmitFeedback, useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common, fonts, radius } from '../theme';

type Props = NativeStackScreenProps<ReaderStackParams, 'Review'>;

const TONE = {
  success: { color: colors.primary, bg: colors.successBg },
  warning: { color: colors.warningText, bg: colors.warningBg },
  error: { color: colors.danger, bg: colors.dangerBg },
};

/** A person checks every reading before anything is registered. */
export function ReviewScreen({ navigation }: Props) {
  const { session, update, verify, submit, online, closeSession } = useReader();
  const [feedback, setFeedback] = useState<SubmitFeedback | null>(null);
  const [busy, setBusy] = useState(false);

  if (!session) {
    return (
      <View style={common.screen}>
        <AppHeader title="Revisión" onBack={() => navigation.goBack()} />
        <Text style={[common.muted, styles.empty]}>No hay sesión abierta.</Text>
      </View>
    );
  }

  const items = S.reviewItems(session);
  const blockers = S.submissionBlockers(session);
  const editable = S.isEditable(session);
  const toRegister = items.filter((i) => i.willRegister).length;
  const unchecked = S.uncheckedEids(session).length;
  const done = session.status === 'submitted';

  const send = async () => {
    setBusy(true);
    setFeedback(await submit());
    setBusy(false);
  };

  const header = (
    <View style={styles.listHeader}>
      <StatsCard
        eyebrow={done ? 'Alta registrada' : 'Para dar de alta'}
        value={toRegister}
        unit={toRegister === 1 ? 'animal nuevo' : 'animales nuevos'}
        stats={[
          { label: 'leídos', value: items.length },
          { label: 'excluidos', value: items.length - toRegister, alert: items.length - toRegister > 0 },
        ]}
        footer={`Destino: ${session.header.batchName}. Se excluyen los ya registrados, los de otra empresa y los sin verificar.`}
      />
      {feedback && (
        <View style={[styles.banner, { backgroundColor: TONE[feedback.tone].bg }]}>
          <Text style={[styles.bannerText, { color: TONE[feedback.tone].color }]}>{feedback.message}</Text>
        </View>
      )}
      {!done && blockers.length > 0 && (
        <View style={[styles.banner, { backgroundColor: colors.dangerBg }]}>
          {blockers.map((b) => (
            <Text key={b} style={[styles.bannerText, { color: colors.danger }]}>• {b}</Text>
          ))}
        </View>
      )}
      <Text style={styles.sectionTitle}>Caravanas leídas</Text>
    </View>
  );

  return (
    <View style={common.screen}>
      <AppHeader title="Revisión" subtitle={session.header.batchName} onBack={() => navigation.goBack()} />

      <FlatList
        data={items}
        keyExtractor={(i) => i.eid}
        contentContainerStyle={common.content}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ReviewRow
            item={item}
            editable={editable && !done}
            onChange={(patch) => update((s) => S.setOverride(s, item.eid, patch))}
            onRemove={() => update((s) => S.removeReading(s, item.eid))}
          />
        )}
      />

      <ActionBar>
        {done ? (
          <PillButton label="Nueva sesión" icon={Plus} onPress={() => { closeSession(); navigation.popToTop(); }} />
        ) : (
          <>
            {!online && <Text style={[common.muted, styles.center]}>Sin conexión con el sistema</Text>}
            {(unchecked > 0 || editable) && (
              <View style={styles.secondaryRow}>
                {unchecked > 0 && (
                  <PillButton label="Verificar" icon={RefreshCw} variant="soft" style={styles.flex} onPress={() => void verify()} />
                )}
                {editable && (
                  <PillButton
                    label="Seguir leyendo"
                    icon={ScanLine}
                    variant="soft"
                    style={styles.flex}
                    onPress={() => { update((s) => S.setStatus(s, 'open')); navigation.navigate('Live'); }}
                  />
                )}
              </View>
            )}
            <PillButton
              label={session.submissionPending ? 'Reintentar envío' : `Dar de alta ${toRegister} animales`}
              icon={CheckCheck}
              loading={busy}
              disabled={editable && blockers.length > 0}
              onPress={send}
            />
          </>
        )}
      </ActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: { gap: 12 },
  banner: { borderRadius: radius.md, padding: 14, gap: 4 },
  bannerText: { fontFamily: fonts.medium, fontSize: 14 },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 4 },
  secondaryRow: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1, paddingHorizontal: 12 },
  center: { textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 32 },
});
