import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChevronRight, Play } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Sex } from '../../../core/entities/RegistrationSession';
import { errorMessage } from '../../../infrastructure/api/ApiClient';
import { BatchOption, BreedOption, CatalogApi, CategoryOption } from '../../../infrastructure/api/CatalogApi';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/ui/Card';
import { PillButton } from '../../components/ui/PillButton';
import { StatusPill } from '../../components/ui/StatusPill';
import { ActionBar } from '../../components/ui/ActionBar';
import { ChipGroup } from '../components/ChipGroup';
import { OptionPicker } from '../components/OptionPicker';
import { useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common, fonts } from '../theme';

type Props = NativeStackScreenProps<ReaderStackParams, 'SessionHeader'>;

const today = () => new Date().toISOString().slice(0, 10);
const TEETH = [0, 2, 4, 6, 8].map((n) => ({ value: n, label: n === 0 ? 'Leche' : n === 8 ? 'Boca llena' : `${n}D` }));

/**
 * What the whole troop shares is declared once here; every animal read inherits it.
 * If a session was left half done it is offered first, so nothing read is lost.
 */
export function SessionHeaderScreen({ navigation }: Props) {
  const { auth, session, startSession, closeSession, selectCompany } = useReader();
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [breeds, setBreeds] = useState<BreedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [batchId, setBatchId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [breedId, setBreedId] = useState<number | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [teeth, setTeeth] = useState(0);
  const [entryDate, setEntryDate] = useState(today());

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([CatalogApi.batches(), CatalogApi.categories(), CatalogApi.breeds()])
      .then(([b, c, r]) => { setBatches(b); setCategories(c); setBreeds(r); setBatchId(null); })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [auth?.company.id]);

  const category = categories.find((c) => c.id === categoryId);
  // A category that implies the sex (vaquillona, novillo…) sets it; the operator can still change it.
  useEffect(() => {
    if (category?.sex === 'M' || category?.sex === 'H') setSex(category.sex);
  }, [category?.sex]);

  if (session) {
    return (
      <View style={common.screen}>
        <AppHeader title="Alta de animales" />
        <View style={common.content}>
          <Card style={styles.resumeCard}>
            <View style={styles.resumeTop}>
              <Text style={styles.resumeBatch} numberOfLines={1}>{session.header.batchName}</Text>
              <StatusPill label="Sin terminar" tone="warning" />
            </View>
            <View style={styles.resumeCountRow}>
              <Text style={styles.resumeCount}>{session.readings.length}</Text>
              <Text style={styles.resumeUnit}>animales leídos</Text>
            </View>
            <Text style={common.muted}>Retomá donde quedaste: las lecturas siguen guardadas en el teléfono.</Text>
            <PillButton
              label="Retomar"
              icon={Play}
              onPress={() => navigation.navigate(session.status === 'open' ? 'Connect' : 'Review')}
            />
            <PillButton
              label="Descartar y empezar otra"
              variant="soft"
              onPress={() => Alert.alert('Descartar sesión', 'Se pierden las lecturas que no se dieron de alta.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Descartar', style: 'destructive', onPress: closeSession },
              ])}
            />
          </Card>
        </View>
      </View>
    );
  }

  const batch = batches.find((b) => b.id === batchId);
  const canStart = batch !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(entryDate);

  const start = () => {
    if (!batch) return;
    startSession({
      batchId: batch.id,
      batchName: batch.name,
      categoryId,
      categoryName: category?.name ?? null,
      subcategoryId: null,
      breedId,
      sex,
      entryDate,
      defaultTeeth: teeth,
    });
    navigation.navigate('Connect');
  };

  return (
    <View style={common.screen}>
      <AppHeader title="Alta de animales" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={common.title}>Nueva sesión</Text>
          <Text style={common.muted}>Lo que comparte toda la tropa se carga una vez; cada animal leído lo hereda.</Text>
        </View>

        {auth && auth.companies.length > 1 && (
          <Card>
            <Text style={common.label}>Empresa</Text>
            <ChipGroup options={auth.companies.map((c) => ({ value: c.id, label: c.name }))} value={auth.company.id} onChange={selectCompany} />
          </Card>
        )}

        {loading && <ActivityIndicator color={colors.primary} />}
        {error && <Text style={styles.error}>No se pudieron cargar los catálogos: {error}</Text>}

        <Card>
          <OptionPicker label="Lote destino" placeholder="Elegí el lote" value={batchId} onChange={setBatchId}
            options={batches.map((b) => ({ id: b.id, label: b.name, detail: b.activity_name }))} />
          <OptionPicker label="Categoría" placeholder="Sin categoría" optional value={categoryId} onChange={setCategoryId}
            options={categories.map((c) => ({ id: c.id, label: c.name }))} />
          <OptionPicker label="Raza" placeholder="Sin raza" optional value={breedId} onChange={setBreedId}
            options={breeds.map((b) => ({ id: b.id, label: b.name }))} />
        </Card>

        <Card>
          <Text style={common.label}>Sexo de la tropa</Text>
          <ChipGroup
            options={[{ value: 'none', label: 'Por animal' }, { value: 'M', label: 'Machos' }, { value: 'H', label: 'Hembras' }]}
            value={sex ?? 'none'}
            onChange={(v) => setSex(v === 'none' ? null : (v as Sex))}
          />
          <Text style={[common.label, styles.spaced]}>Dentición por defecto</Text>
          <ChipGroup<number> options={TEETH} value={teeth} onChange={setTeeth} />
          <Text style={[common.label, styles.spaced]}>Fecha de ingreso</Text>
          <TextInput style={common.input} value={entryDate} onChangeText={setEntryDate} placeholder="AAAA-MM-DD" />
        </Card>
      </ScrollView>

      <ActionBar>
        <PillButton label="Continuar: conectar el lector" icon={ChevronRight} disabled={!canStart} onPress={start} />
      </ActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14 },
  intro: { gap: 4, marginBottom: 2 },
  spaced: { marginTop: 6 },
  error: { fontFamily: fonts.regular, fontSize: 14, color: colors.danger },
  resumeCard: { gap: 12 },
  resumeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resumeBatch: { flex: 1, fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  resumeCountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  resumeCount: { fontFamily: fonts.semibold, fontSize: 52, lineHeight: 56, color: colors.text },
  resumeUnit: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, paddingBottom: 8 },
});
