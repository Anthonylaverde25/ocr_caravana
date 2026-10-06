import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bluetooth } from 'lucide-react-native';
import { DiscoveredReader, Unsubscribe } from '../../../core/readers/ReaderSource';
import { READER_PROFILES } from '../../../core/readers/profiles';
import { ChipGroup } from '../components/ChipGroup';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common } from '../theme';

type Props = NativeStackScreenProps<ReaderStackParams, 'Connect'>;

export function ReaderConnectScreen({ navigation }: Props) {
  const { profile, setProfile, sourceKind, setSourceKind, source, status, online } = useReader();
  const [found, setFound] = useState<DiscoveredReader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const stopScan = useRef<Unsubscribe | null>(null);

  useEffect(() => () => stopScan.current?.(), []);

  if (status.state === 'connected') {
    return (
      <View style={[common.screen, common.content]}>
        <ConnectionBadge status={status} online={online} />
        <TouchableOpacity style={common.button} onPress={() => navigation.navigate('Live')}>
          <Text style={common.buttonText}>Ir a la lectura</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[common.button, common.buttonSecondary]} onPress={() => source.disconnect()}>
          <Text style={[common.buttonText, common.buttonSecondaryText]}>Desconectar lector</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      navigation.navigate('Live');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ConnectionBadge status={status} online={online} />

      <View style={common.card}>
        <Text style={common.label}>Origen de las lecturas</Text>
        <ChipGroup
          options={[{ value: 'ble', label: 'Lector Bluetooth' }, { value: 'mock', label: 'Simulado en la app' }]}
          value={sourceKind}
          onChange={(k) => { stopScan.current?.(); setFound([]); setSourceKind(k); }}
        />
        <Text style={common.label}>Modelo de lector</Text>
        <ChipGroup
          options={READER_PROFILES.map((p) => ({ value: p.code, label: p.displayName }))}
          value={profile.code}
          onChange={(code) => { setFound([]); setProfile(READER_PROFILES.find((p) => p.code === code)!); }}
        />
        {profile.simulated && <Text style={common.muted}>Perfil simulado: sus datos imitan la marca, no vienen del fabricante.</Text>}
      </View>

      <TouchableOpacity style={common.button} onPress={scan}>
        <Text style={common.buttonText}>Buscar lectores</Text>
      </TouchableOpacity>
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      {found.map((reader) => (
        <TouchableOpacity key={reader.id} style={[common.card, common.row]} onPress={() => connect(reader)}>
          <Bluetooth color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={common.body}>{reader.name}</Text>
            <Text style={common.muted}>{reader.rssi !== null ? `Señal ${reader.rssi} dBm · ` : ''}{reader.id}</Text>
          </View>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Conectar</Text>
        </TouchableOpacity>
      ))}
      {status.state === 'scanning' && found.length === 0 && (
        <Text style={common.muted}>Buscando lectores que transmitan con el perfil "{profile.displayName}"…</Text>
      )}
    </ScrollView>
  );
}
