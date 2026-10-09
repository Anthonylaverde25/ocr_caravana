import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertCircle, ScanLine, Search } from 'lucide-react-native';
import { normalizeCaravan } from '../../../core/caravans/AnimalRecord';
import { ReaderStatus } from '../../../core/readers/ReaderSource';
import { colors, fonts, formatEid, radius, shadow } from '../../reader/theme';
import { StatusPill } from '../ui/StatusPill';

interface Props {
  status: ReaderStatus;
  /** The caravan being looked up right now, if any. */
  loadingEid: string | null;
  error: string | null;
  onLookup: (eid: string) => void;
}

/** Waits for the wand, and takes a typed number for when there is no wand or the tag will not read. */
export function LookupPrompt({ status, loadingEid, error, onLookup }: Props) {
  const [typed, setTyped] = useState('');
  const [invalid, setInvalid] = useState(false);
  const connected = status.state === 'connected';

  const submit = () => {
    const eid = normalizeCaravan(typed);
    setInvalid(eid === null);
    if (eid) onLookup(eid);
  };

  return (
    <View style={styles.card}>
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <View style={styles.core}>
            {loadingEid ? <ActivityIndicator color={colors.onPrimary} /> : <ScanLine size={34} color={colors.onPrimary} />}
          </View>
        </View>
      </View>

      <Text style={styles.title}>{loadingEid ? 'Buscando la caravana…' : connected ? 'Acercá el bastón a la caravana' : 'Escribí la caravana'}</Text>
      <Text style={styles.text}>
        {loadingEid
          ? formatEid(loadingEid)
          : 'Apenas la leas te mostramos la ficha del animal: categoría, lote, peso y estado reproductivo.'}
      </Text>
      {connected ? (
        <StatusPill label={`Bastón conectado · ${status.deviceName}`} tone="success" />
      ) : (
        <StatusPill label="Sin bastón conectado" />
      )}

      {error && (
        <View style={styles.error}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.or}>
        <View style={styles.line} />
        <Text style={styles.orText}>{connected ? 'o escribila' : 'número de caravana'}</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.manual}>
        <View style={[styles.field, invalid && styles.fieldInvalid]}>
          <Search size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            value={typed}
            onChangeText={(text) => { setTyped(text); setInvalid(false); }}
            placeholder="EID o caravana visual"
            placeholderTextColor={colors.subtle}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={submit}
            accessibilityLabel="Número de caravana"
          />
        </View>
        <TouchableOpacity style={styles.go} onPress={submit} accessibilityRole="button">
          <Text style={styles.goText}>Buscar</Text>
        </TouchableOpacity>
      </View>
      {invalid && <Text style={styles.invalid}>Usá letras, números, guiones o barras (hasta 64).</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
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
  ringOuter: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  core: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text, textAlign: 'center' },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', maxWidth: 290 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', padding: 12, borderRadius: radius.md, backgroundColor: colors.dangerBg },
  errorText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
  or: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  line: { flex: 1, height: 1, backgroundColor: colors.borderSubtle },
  orText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  manual: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  fieldInvalid: { borderColor: colors.danger },
  input: { flex: 1, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  go: { justifyContent: 'center', paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: colors.primary },
  goText: { fontFamily: fonts.medium, fontSize: 15, color: colors.onPrimary },
  invalid: { alignSelf: 'flex-start', fontFamily: fonts.regular, fontSize: 12, color: colors.danger },
});
