import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as S from '../../../core/entities/RegistrationSession';
import { ReviewRow } from '../components/ReviewRow';
import { SubmitFeedback, useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common } from '../theme';

type Props = NativeStackScreenProps<ReaderStackParams, 'Review'>;

const TONE = {
  success: { color: colors.success, bg: colors.successBg },
  warning: { color: colors.warning, bg: colors.warningBg },
  error: { color: colors.danger, bg: colors.dangerBg },
};

/** A person checks every reading before anything is registered. */
export function ReviewScreen({ navigation }: Props) {
  const { session, update, verify, submit, online, closeSession } = useReader();
  const [feedback, setFeedback] = useState<SubmitFeedback | null>(null);
  const [busy, setBusy] = useState(false);

  if (!session) {
    return <View style={[common.screen, common.content]}><Text style={common.muted}>No hay sesión abierta.</Text></View>;
  }

  const items = S.reviewItems(session);
  const blockers = S.submissionBlockers(session);
  const editable = S.isEditable(session);
  const toRegister = items.filter((i) => i.willRegister).length;
  const done = session.status === 'submitted';

  const send = async () => {
    setBusy(true);
    setFeedback(await submit());
    setBusy(false);
  };

  const header = (
    <View style={{ gap: 12 }}>
      <View style={common.card}>
        <Text style={common.label}>Resumen</Text>
        <Text style={common.body}>{toRegister} nuevos para dar de alta en {session.header.batchName}</Text>
        <Text style={common.muted}>{items.length - toRegister} excluidos (ya registrados, de otra empresa o sin verificar)</Text>
      </View>
      {feedback && (
        <View style={[common.card, { backgroundColor: TONE[feedback.tone].bg }]}>
          <Text style={{ color: TONE[feedback.tone].color, fontWeight: '600' }}>{feedback.message}</Text>
        </View>
      )}
      {!done && blockers.length > 0 && (
        <View style={[common.card, { backgroundColor: colors.dangerBg }]}>
          {blockers.map((b) => <Text key={b} style={{ color: colors.danger }}>• {b}</Text>)}
        </View>
      )}
    </View>
  );

  return (
    <View style={common.screen}>
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

      <View style={{ padding: 16, gap: 8 }}>
        {done ? (
          <TouchableOpacity style={common.button} onPress={() => { closeSession(); navigation.popToTop(); }}>
            <Text style={common.buttonText}>Nueva sesión</Text>
          </TouchableOpacity>
        ) : (
          <>
            {!online && <Text style={[common.muted, { textAlign: 'center' }]}>Sin conexión con el sistema</Text>}
            {S.uncheckedEids(session).length > 0 && (
              <TouchableOpacity style={[common.button, common.buttonSecondary]} onPress={() => void verify()}>
                <Text style={[common.buttonText, common.buttonSecondaryText]}>Verificar ahora</Text>
              </TouchableOpacity>
            )}
            {editable && (
              <TouchableOpacity
                style={[common.button, common.buttonSecondary]}
                onPress={() => { update((s) => S.setStatus(s, 'open')); navigation.navigate('Live'); }}
              >
                <Text style={[common.buttonText, common.buttonSecondaryText]}>Seguir leyendo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[common.button, (busy || (editable && blockers.length > 0)) && common.buttonDisabled]}
              disabled={busy || (editable && blockers.length > 0)}
              onPress={send}
            >
              {busy ? <ActivityIndicator color="white" /> : (
                <Text style={common.buttonText}>
                  {session.submissionPending ? 'Reintentar envío' : `Dar de alta ${toRegister} animales`}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
