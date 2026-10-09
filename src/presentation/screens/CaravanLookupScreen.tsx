import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { Plus, ScanLine } from 'lucide-react-native';
import { AppHeader, HeaderBand } from '../components/AppHeader';
import { LookupPrompt } from '../components/caravan/LookupPrompt';
import { NotRegistered } from '../components/caravan/NotRegistered';
import { RecentLookups } from '../components/caravan/RecentLookups';
import { RecordView } from '../components/caravan/RecordView';
import { ActionBar } from '../components/ui/ActionBar';
import { PillButton } from '../components/ui/PillButton';
import { useCaravanLookup } from '../caravan/useCaravanLookup';
import { useReader } from '../reader/ReaderContext';
import { colors } from '../reader/theme';

/** Read (or type) a caravan and see the animal's key data. Readings here never join a session. */
export function CaravanLookupScreen() {
  const navigation = useNavigation<any>();
  const { status, auth } = useReader();
  const { state, recent, lookup, reset, clearRecent } = useCaravanLookup();
  const showingResult = state.phase !== 'idle' && state.phase !== 'loading' && state.phase !== 'error';

  // Back from a result returns to reading, not out of the screen (hardware back included). Only
  // back actions: leaving for the reader flow (popTo) must still leave. iOS's swipe cannot be
  // intercepted, so it is off while a result is shown.
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !showingResult });
    if (!showingResult) return;
    return navigation.addListener('beforeRemove', (event: any) => {
      const type = event.data?.action?.type;
      if (type !== 'GO_BACK' && type !== 'POP') return;
      event.preventDefault();
      reset();
    });
  }, [navigation, showingResult, reset]);

  const registerInSession = () =>
    navigation.dispatch(
      StackActions.popTo('MainTabs', {
        screen: 'Lector',
        params: { screen: status.state === 'connected' ? 'SessionHeader' : 'Connect' },
      }),
    );

  const header = (
    <AppHeader
      title={state.phase === 'found' ? 'Ficha del animal' : 'Consultar caravana'}
      subtitle={showingResult ? 'Leé otra caravana para abrir su ficha' : 'Leé o escribí una caravana'}
      extended
      onBack={() => navigation.goBack()}
    />
  );

  if (state.phase === 'found') {
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView showsVerticalScrollIndicator={false}>
          <RecordView record={state.record} weights={state.weights} movements={state.movements} />
        </ScrollView>
        <ActionBar>
          <PillButton label="Leer otra caravana" icon={ScanLine} onPress={reset} />
        </ActionBar>
      </View>
    );
  }

  if (state.phase === 'not_found' || state.phase === 'other_company') {
    const otherCompany = state.phase === 'other_company';
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          <HeaderBand />
          <NotRegistered eid={state.identification} otherCompany={otherCompany} companyName={auth?.company.name ?? 'esta empresa'} />
        </ScrollView>
        <ActionBar>
          {!otherCompany && <PillButton label="Dar de alta en una sesión" icon={Plus} onPress={registerInSession} />}
          <PillButton label="Leer otra caravana" icon={ScanLine} variant={otherCompany ? 'primary' : 'soft'} onPress={reset} />
        </ActionBar>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <HeaderBand />
        <LookupPrompt
          status={status}
          loadingEid={state.phase === 'loading' ? state.eid : null}
          error={state.phase === 'error' ? state.message : null}
          onLookup={(eid) => void lookup(eid)}
        />
        <RecentLookups items={recent} onOpen={(eid) => void lookup(eid)} onClear={clearRecent} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 20 },
});
