import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bluetooth, BluetoothSearching, ChevronRight, Radio, ScanLine, Unplug } from 'lucide-react-native';
import { DiscoveredReader, Unsubscribe } from '../../../core/readers/ReaderSource';
import { READER_PROFILES } from '../../../core/readers/profiles';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/ui/Card';
import { PillButton } from '../../components/ui/PillButton';
import { ChipGroup } from '../components/ChipGroup';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common, fonts, radius } from '../theme';

type Props = NativeStackScreenProps<ReaderStackParams, 'Connect'>;

export function ReaderConnectScreen({ navigation }: Props) {
  const { profile, setProfile, sourceKind, setSourceKind, source, status, online, session } = useReader();
  const [found, setFound] = useState<DiscoveredReader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const stopScan = useRef<Unsubscribe | null>(null);

  useEffect(() => () => stopScan.current?.(), []);

  const connected = status.state === 'connected';
  const reading = session?.status === 'open';

  /**
   * Where the flow goes once the wand is connected. Connect may sit on top of a screen that sent
   * the operator here to reconnect; going back to it (popTo) keeps that screen as it was, the
   * troop form half filled or the live list. A session left open goes straight back to reading.
   */
  const continueFlow = () => {
    const inStack = navigation.getState().routes.map((r) => r.name);
    if (reading) {
      if (inStack.includes('Live')) navigation.popTo('Live');
      else navigation.reset({ index: 2, routes: [{ name: 'Connect' }, { name: 'SessionHeader' }, { name: 'Live' }] });
    } else if (inStack.includes('SessionHeader')) {
      navigation.popTo('SessionHeader');
    } else {
      navigation.navigate('SessionHeader');
    }
  };

  const scan = async () => {
    stopScan.current?.();
    setFound([]);
    setError(null);
    try {
      stopScan.current = await source.scan(profile, (reader) => setFound((list) => [...list, reader]));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const connect = async (reader: DiscoveredReader) => {
    stopScan.current?.();
    setError(null);
    try {
      await source.connect(reader.id, profile);
      continueFlow();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <View style={common.screen}>
      <AppHeader
        title="Lector"
        subtitle={profile.displayName}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.statusCard}>
          <View style={[styles.statusIcon, connected && styles.statusIconOn]}>
            {connected ? (
              <Bluetooth size={30} color={colors.onPrimary} />
            ) : (
              <BluetoothSearching size={30} color={colors.primary} />
            )}
          </View>
          <Text style={styles.statusTitle}>{connected ? 'Bastón conectado' : 'Conectá el bastón'}</Text>
          <ConnectionBadge status={status} online={online} />
        </Card>

        {connected ? (
          <View style={styles.actions}>
            <PillButton
              label={reading ? 'Volver a la lectura' : session ? 'Retomar la sesión' : 'Continuar: datos de la tropa'}
              icon={ChevronRight}
              onPress={continueFlow}
            />
            <PillButton label="Desconectar lector" icon={Unplug} variant="soft" onPress={() => source.disconnect()} />
          </View>
        ) : (
          <>
            <Card>
              <Text style={common.label}>Origen de las lecturas</Text>
              <ChipGroup
                options={[{ value: 'ble', label: 'Lector Bluetooth' }, { value: 'mock', label: 'Simulado en la app' }]}
                value={sourceKind}
                onChange={(k) => { stopScan.current?.(); setFound([]); setSourceKind(k); }}
              />
              <Text style={[common.label, styles.spaced]}>Modelo de lector</Text>
              <ChipGroup
                options={READER_PROFILES.map((p) => ({ value: p.code, label: p.displayName }))}
                value={profile.code}
                onChange={(code) => { setFound([]); setProfile(READER_PROFILES.find((p) => p.code === code)!); }}
              />
              {profile.simulated && (
                <Text style={common.muted}>Perfil simulado: sus datos imitan la marca, no vienen del fabricante.</Text>
              )}
            </Card>

            <PillButton label="Buscar lectores" icon={ScanLine} onPress={scan} />
            {error && <Text style={styles.error}>{error}</Text>}

            {found.length > 0 && <Text style={styles.sectionTitle}>Lectores encontrados</Text>}
            {found.map((reader) => (
              <TouchableOpacity key={reader.id} style={styles.readerRow} onPress={() => connect(reader)} activeOpacity={0.75}>
                <View style={styles.readerIcon}>
                  <Radio size={20} color={colors.primary} />
                </View>
                <View style={styles.readerBody}>
                  <Text style={styles.readerName} numberOfLines={1}>{reader.name}</Text>
                  <Text style={common.muted} numberOfLines={1}>
                    {reader.rssi !== null ? `Señal ${reader.rssi} dBm · ` : ''}{reader.id}
                  </Text>
                </View>
                <Text style={styles.connect}>Conectar</Text>
              </TouchableOpacity>
            ))}
            {status.state === 'scanning' && found.length === 0 && (
              <Text style={[common.muted, styles.center]}>
                Buscando lectores que transmitan con el perfil "{profile.displayName}"…
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14 },
  statusCard: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  statusIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconOn: { backgroundColor: colors.primary },
  statusTitle: { fontFamily: fonts.semibold, fontSize: 20, color: colors.text },
  actions: { gap: 10 },
  spaced: { marginTop: 6 },
  error: { fontFamily: fonts.regular, fontSize: 14, color: colors.danger },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 4 },
  readerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  readerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerBody: { flex: 1, gap: 2 },
  readerName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  connect: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  center: { textAlign: 'center' },
});
