import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { ClipboardCheck } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/ui/PillButton';
import { StatsCard } from '../../components/ui/StatsCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { ActionBar } from '../../components/ui/ActionBar';
import { CONNECTION_LOOK } from '../components/ConnectionBadge';
import { DiscardedPanel } from '../components/DiscardedPanel';
import { ReadingPausedBanner } from '../components/ReadingPausedBanner';
import { ReadingRow } from '../components/ReadingRow';
import { useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common, fonts } from '../theme';
import * as S from '../../../core/entities/RegistrationSession';

type Props = NativeStackScreenProps<ReaderStackParams, 'Live'>;

export function LiveReadingScreen({ navigation }: Props) {
  useKeepAwake();
  const { session, status, online, update } = useReader();

  if (!session) {
    return (
      <View style={common.screen}>
        <AppHeader title="Lectura en manga" onBack={() => navigation.goBack()} />
        <Text style={[common.muted, styles.empty]}>No hay sesión abierta.</Text>
      </View>
    );
  }

  const total = session.readings.length;
  const reads = session.readings.reduce((sum, r) => sum + r.readCount, 0);
  const known = session.readings.filter((r) => ['own_company', 'other_company'].includes(session.lookup[r.eid])).length;
  const look = CONNECTION_LOOK[status.state];

  const toReview = () => {
    update((s) => S.setStatus(s, 'review'));
    navigation.navigate('Review');
  };

  const header = (
    <View style={styles.listHeader}>
      <StatsCard
        eyebrow={session.header.categoryName ?? 'Alta de animales'}
        value={total}
        unit={total === 1 ? 'animal' : 'animales'}
        stats={[
          { label: 'lecturas', value: reads },
          { label: 'ya registrados', value: known, alert: known > 0 },
        ]}
        footer={online ? `Destino: ${session.header.batchName}` : 'Sin sistema: las lecturas se guardan en el teléfono.'}
        accessory={<StatusPill label={look.label} tone={look.tone} />}
      />
      {/* Connect opens on top of this screen and comes back here once the wand is connected again. */}
      <ReadingPausedBanner status={status} savedCount={total} onReconnect={() => navigation.navigate('Connect')} />
      <DiscardedPanel discarded={session.discarded} />
      {total > 0 && <Text style={styles.sectionTitle}>Últimas lecturas</Text>}
    </View>
  );

  return (
    <View style={common.screen}>
      <AppHeader title="Lectura en manga" subtitle={session.header.batchName} onBack={() => navigation.goBack()} />

      <FlatList
        data={session.readings}
        keyExtractor={(r) => r.eid}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => (
          <ReadingRow
            reading={item}
            status={session.lookup[item.eid] ?? 'unchecked'}
            index={total - index}
            latest={index === 0}
          />
        )}
        ListEmptyComponent={<Text style={[common.muted, styles.empty]}>Esperando la primera lectura…</Text>}
      />

      <ActionBar>
        <PillButton label="Terminar lectura y revisar" icon={ClipboardCheck} disabled={total === 0} onPress={toReview} />
      </ActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 8 },
  listHeader: { gap: 12, marginBottom: 4 },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 32 },
});
