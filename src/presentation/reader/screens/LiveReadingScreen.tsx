import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { DiscardedPanel } from '../components/DiscardedPanel';
import { ReadingRow } from '../components/ReadingRow';
import { useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common } from '../theme';
import * as S from '../../../core/entities/RegistrationSession';

type Props = NativeStackScreenProps<ReaderStackParams, 'Live'>;

export function LiveReadingScreen({ navigation }: Props) {
  useKeepAwake();
  const { session, status, online, update } = useReader();

  if (!session) {
    return <View style={[common.screen, common.content]}><Text style={common.muted}>No hay sesión abierta.</Text></View>;
  }

  const total = session.readings.length;
  const reads = session.readings.reduce((sum, r) => sum + r.readCount, 0);
  const known = session.readings.filter((r) => ['own_company', 'other_company'].includes(session.lookup[r.eid])).length;

  const toReview = () => {
    update((s) => S.setStatus(s, 'review'));
    navigation.navigate('Review');
  };

  return (
    <View style={common.screen}>
      <View style={[common.content, { paddingBottom: 0 }]}>
        <ConnectionBadge status={status} online={online} />
        <View style={[common.card, common.row, { justifyContent: 'space-around' }]}>
          <Counter value={total} label="animales" />
          <Counter value={reads} label="lecturas" />
          <Counter value={known} label="ya registrados" color={known > 0 ? colors.warning : undefined} />
        </View>
        <Text style={common.muted}>{session.header.batchName}{session.header.categoryName ? ` · ${session.header.categoryName}` : ''}</Text>
        <DiscardedPanel discarded={session.discarded} />
      </View>

      <FlatList
        data={session.readings}
        keyExtractor={(r) => r.eid}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item, index }) => (
          <ReadingRow reading={item} status={session.lookup[item.eid] ?? 'unchecked'} index={total - index} />
        )}
        ListEmptyComponent={<Text style={[common.muted, { textAlign: 'center', marginTop: 32 }]}>Esperando la primera lectura…</Text>}
      />

      <View style={{ padding: 16 }}>
        <TouchableOpacity style={[common.button, total === 0 && common.buttonDisabled]} disabled={total === 0} onPress={toReview}>
          <Text style={common.buttonText}>Terminar lectura y revisar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Counter({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: color ?? colors.text }}>{value}</Text>
      <Text style={common.muted}>{label}</Text>
    </View>
  );
}
